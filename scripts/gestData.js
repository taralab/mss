
let currentExportVersion = 1 ;//version actuel des fichers d'import/export

function onOpenMenuGestData() {

    // Set la version du fichier d'import autorisé
    document.getElementById("pGestDataVersionImportAccepted").innerHTML = `V${currentExportVersion}`;

    //Set la date de la dernière sauvegarde manuelle
    document.getElementById("pGestDataLastExportDate").innerHTML = userSetting.lastManualSaveDate === "noSet" ? "Date dernier export : Indisponible." : `Date dernier export : le ${onFormatDateToFr(userSetting.lastManualSaveDate)} à ${userSetting.lastManualSaveTime}`;

};




// ---------------------     EXPORT -------------------------------------

//Lors d'un export manual ou auto
// Step 1 sauvegarde de la date du jour dans setting
//Step 2 lancement de export

// La date du jour pour l'export
let exportDate,
    exportTime,//format 00:00
    exportTimeFileName;//format 0000


async function eventSaveData(isAutoSave) {

    // Sauvegarde la date dans setting
    // Set la date du jour ainsi que l'heure
    exportDate = onFindDateTodayUS();

    // Set l'heure mais en retirant les ":" pour l'enregistrement du nom de fichier
    exportTime = onGetCurrentTime();
    exportTimeFileName = exportTime.replace(":","");


    if (devMode === true){
        console.log("[SAVE] Demande d'export des données");
        console.log("[SAVE] demande automatique ? : " + isAutoSave);
        console.log("[SAVE] sauvegarde de la date dans les setting");
    };

   

    if (isAutoSave) {
        userSetting.lastAutoSaveDate = exportDate;
        userSetting.lastAutoSaveTime = exportTime;
    }else{
        userSetting.lastManualSaveDate = exportDate;
        userSetting.lastManualSaveTime = exportTime;
    }

    // Enregistrement date/heure dans les paramètres
    // Sauvegarde la modification
    await updateDocumentInDB(settingStoreName, (doc) => {
        doc.data = userSetting;
        return doc;
    });


    // suite à enregistrement de la date, export des données
    await exportDBToJson(isAutoSave);
    eventSaveResult(isAutoSave);
}

async function exportDBToJson(isAutoSave) {
    if (devMode === true) {
        console.log("Demande d'exportation des données");
    }
    try {
        const result = await db.allDocs({ include_docs: true });

        // Extraire uniquement les documents
        const exportedDocs = result.rows.map(row => row.doc);

        // Ajouter l'objet userCounterList et le formatVersion
        getCounterListFromLocalStorage();//au cas ou l'utilisateur ne l'a pas chargé

        const fullExport = {
            formatVersion: currentExportVersion, // ← ← ← Version actuelle du format
            documents: exportedDocs,
            userCounterList: userCounterList
        };

        // Convertir en JSON
        const jsonData = JSON.stringify(fullExport, null, 2);

        // Nom du fichier
        let fileName = "";
        if (isAutoSave) {
            fileName = `MSS_V${currentExportVersion}_AUTOSAVE_${exportDate}_${exportTimeFileName}_${userInfo.pseudo}.json`;
        } else {
            fileName = `MSS_V${currentExportVersion}_${exportDate}_${exportTimeFileName}_${userInfo.pseudo}.json`;
        }

        // Télécharger le fichier JSON
        const blob = new Blob([jsonData], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("📂 Base de données exportée avec succès !");
    } catch (err) {
        console.error("❌ Erreur lors de l'exportation :", err);
    }
}


// ----------------------------     sauvegarde automatique     ----------------------------------







// Vérification condition autosave
async function onCheckAutoSaveCondition() {
    if (devMode === true) {
        console.log("[AUTOSAVE] Vérification des conditions de sauvegarde");
    }

    let isSaveRequired = false;

    // Si cookies last date est vide = AutoSAVE
    if (userSetting.lastAutoSaveDate === "noSet") {
        if (devMode === true) {
            console.log("[AUTOSAVE] date dans userSetting noSet, demande de sauvegarde");
        }
        isSaveRequired = true;
    } else {
        // Sinon, contrôle l'intervalle entre date du jour et date dernière sauvegarde
        isSaveRequired = compareDateAutoSave(userSetting.lastAutoSaveDate, userSetting.autoSaveFrequency);
    }

    return isSaveRequired;
}

// Fonction pour savoir si la date d'ancienne sauvegarde est encore valide ou non
function compareDateAutoSave(lastDateSave, frequency) {
    const d1 = new Date(lastDateSave);
    const d2 = new Date(); // Date actuelle

    if (isNaN(d1.getTime())) {
        console.error("[AUTOSAVE] La date de sauvegarde est invalide :", lastDateSave);
        return false; // Sortie pour éviter des comportements imprévisibles
    }

    const differenceMs = Math.abs(d2 - d1);
    const differenceEnJours = differenceMs / (1000 * 60 * 60 * 24);

    if (devMode === true) {
        console.log("[AUTOSAVE] Comparaison des dates");
        console.log("[AUTOSAVE] Date de dernière sauvegarde :", d1);
        console.log("[AUTOSAVE] Date du jour :", d2);
        console.log("[AUTOSAVE] Fréquence (jours) :", frequency);
        console.log("[AUTOSAVE] Différence en jours :", differenceEnJours);
    }

    return differenceEnJours >= frequency;
}





function eventSaveResult(isAutoSave){
    if (devMode === true) {console.log("[AUTOSAVE] Fin de sauvegarde, actualisation set la date au bon emplacement");};

    if (isAutoSave) {
        // Mise à jour du texte 
        document.getElementById("pSettingLastAutoSaveDate").innerHTML = `Le ${onFormatDateToFr(userSetting.lastAutoSaveDate)} à ${userSetting.lastAutoSaveTime}`;
    }else{
        // Mise à jour du texte
        document.getElementById("pGestDataLastExportDate").innerHTML = `Date dernier export : le ${onFormatDateToFr(userSetting.lastManualSaveDate)} à ${userSetting.lastManualSaveTime}`;
    }

    if (devMode === true) {
        console.log(userSetting);
    }

};




// -------------------------------- IMPORT -----------------------------------------------------




async function eventImportBdD(inputRef) {
    const fileInput = document.getElementById(inputRef);
    let textResultRef = document.getElementById("pImportActivityResult");

    onSetLockGestDataButton(true);

    if (fileInput.files.length > 0) {
        textResultRef.innerHTML = "Veuillez patienter...";
        const selectedFile = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                onDisplayTextDataBaseEvent(false);

                // Charger et analyser le JSON
                const jsonData = JSON.parse(e.target.result);

                // Détection du formatVersion (_v0 si inexistant = ancien format)
                const version = jsonData.formatVersion || 0;
                let importedDocs = [];
                let importedUserCounterList = {};

                switch (version) {
                    case 0:
                        // Ancien format (tableau direct ou objet sans version)
                        importedDocs = Array.isArray(jsonData) ? jsonData : jsonData.documents || [];
                        importedUserCounterList = {}; // Pas dispo dans ce format
                        break;

                    case 1:
                        // Nouveau format structuré avec documents + userCounterList
                        importedDocs = jsonData.documents || [];
                        importedUserCounterList = jsonData.userCounterList || {};
                        break;

                    default:
                        throw new Error("⚠️ Format de fichier inconnu. Veuillez mettre à jour l'application.");
                }

                // 1 Effacer toutes les données existantes dans local storage et PouchDB
                onDeleteLocalStorage();
                await deleteBase();

                // 2 Créer la base
                db = new PouchDB(dbName, { auto_compaction: true });
                await db.info().then(info => console.log(' [DATABASE] Base créée/ouverte :', info));

                // 3 Créer les stores
                await onCreateDBStore();

                // 4 Restaurer userCounterList si disponible
                if (version >= 1 && importedUserCounterList) {
                    userCounterList = importedUserCounterList;
                    console.log('[IMPORT] userCounterList restauré :', userCounterList);
                    onUpdateCounterSessionInStorage();
                }


                // 5 Importer les documents
                await importBdD(importedDocs);

                textResultRef.innerHTML = "Importation réussie !";
            } catch (error) {
                console.error('[IMPORT] Erreur lors du traitement du JSON:', error);
                textResultRef.innerHTML = "Erreur d'importation.";
            } finally {
                // onSetLockGestDataButton(false);
                //N'affiche plus les boutons si l'opération à réussi car l'appli va redémarrer
            }
        };

        reader.readAsText(selectedFile);
    } else {
        console.error('[IMPORT] Aucun fichier sélectionné.');
        textResultRef.innerHTML = "Aucun fichier sélectionné !";
        onSetLockGestDataButton(false);
    }
}




async function importBdD(dataToImport) {
    console.log("IMPORTBDD");

    // Récupère la taille pour traiter le texte de pourcentage 
    let totalDataToImport = dataToImport.length,
    pPercentImportTextRef = document.getElementById("pPercentImportText"),
    importPercentStep = Math.floor(totalDataToImport * 0.1), // 10% arrondi vers le bas
    importCount = 0;

    for (const e of dataToImport) {
        // ACTIVITE
        if (e.type === activityStoreName) {
            Object.assign(activityToInsertFormat, {
                name: e.name,
                date: e.date,
                location: e.location,
                distance: e.distance,
                duration: e.duration,
                comment: e.comment,
                createdAt: e.createdAt,
                isPlanned: e.isPlanned
            });
            await onInsertNewActivityInDB(activityToInsertFormat);

        // TEMPLATE
        }else if (e.type === templateStoreName){
            Object.assign(templateToInsertFormat, {
                title: e.title,
                activityName: e.activityName,
                location: e.location,
                distance: e.distance,
                duration: e.duration,
                comment: e.comment,
                isPlanned:e.isPlanned
            });
            await onInsertNewTemplateInDB(templateToInsertFormat);

        //REWARDS
        }else if (e.type === rewardsStoreName){
           await updateDocumentInDB(rewardsStoreName, (doc) => {
            doc.rewards = e.rewards;
            return doc;
        });

        //SPECIAL REWARDS
        }else if (e.type === specialRewardsStoreName){
           await updateDocumentInDB(specialRewardsStoreName, (doc) => {
            doc.specialRewards = e.specialRewards;
            return doc;
        });

        //SETTING
        }else if (e.type === settingStoreName){
            let settingToUpdate = {};
            Object.assign(settingToUpdate, {
                agenda : e.data.agenda || defaultSetting.agenda,
                agendaScheduleStart: e.data.agendaScheduleStart || defaultSetting.agendaScheduleStart,
                agendaScheduleEnd: e.data.agendaScheduleEnd || defaultSetting.agendaScheduleEnd,
                displayCommentDoneMode: e.data.displayCommentDoneMode || defaultSetting.displayCommentDoneMode,
                displayCommentPlannedMode: e.data.displayCommentPlannedMode || defaultSetting.displayCommentPlannedMode,
                isAutoSaveEnabled: e.data.isAutoSaveEnabled ?? defaultSetting.isAutoSaveEnabled,
                lastAutoSaveDate: e.data.lastAutoSaveDate || defaultSetting.lastAutoSaveDate,
                lastAutoSaveTime: e.data.lastAutoSaveTime || defaultSetting.lastAutoSaveTime,
                lastManualSaveDate: e.data.lastManualSaveDate || defaultSetting.lastManualSaveDate,
                lastManualSaveTime: e.data.lastManualSaveTime || defaultSetting.lastManualSaveTime,
                autoSaveFrequency: e.data.autoSaveFrequency || defaultSetting.autoSaveFrequency,
                fromSessionToActivityMode : e.data.fromSessionToActivityMode || defaultSetting.fromSessionToActivityMode,
                devMode : e.data.devMode ?? defaultSetting.devMode,
                animationEnabled: e.data.animationEnabled ?? defaultSetting.animationEnabled
            });

            // Sauvegarde la modification
            await updateDocumentInDB(settingStoreName, (doc) => {
                doc.data = settingToUpdate;
                return doc;
            });

        //FAVORIS
        }else if (e.type === favorisStoreName){

           await updateDocumentInDB(favorisStoreName, (doc) => {
            doc.favorisList = e.favorisList;
            return doc;
        });
    

        // PROFILS 
        }else if (e.type === profilStoreName){
            Object.assign(userInfo,{
                pseudo : e.data.pseudo,
                customNotes : e.data.customNotes,
                conditionAccepted: e.data.conditionAccepted
            });
            
            //Sauvegarde
            await updateDocumentInDB(profilStoreName, (doc) => {
                doc.data = userInfo;
                return doc;
            });

        // TEMPLATE SESSION
        } else if (e.type === templateSessionStoreName){
            let newtemplateSession = {
                sessionName: e.sessionName,
                counterList : e.counterList
            }
            await onInsertNewTemplateSessionInDB(newtemplateSession);

        //PLANNING
        } else if (e.type === planningStoreName){
           await updateDocumentInDB(planningStoreName, (doc) => {
                doc.userPlanning = e.userPlanning;
                return doc;
            });
        }


        // Traitement des pourcentages
        importCount++;

        if (importCount >= importPercentStep) {
            let progress = Math.round((importCount / totalDataToImport) * 100);
            requestAnimationFrame(() => {
                pPercentImportTextRef.textContent = `${progress}%`;
            });

            importPercentStep += Math.floor(totalDataToImport * 0.1); // set le prochain palier
        }


    }



    // 3️⃣ Finalisation
    eventImportDataSucess();
}



// Action lors du succes d'un import
function eventImportDataSucess() {
    console.log("wait for reload");
    
    onShowNotifyPopup("importSuccess");
    setTimeout(() => {
        location.reload();
      }, "2000");
}



// -----------------------------------------------  Suppression des données de la base ----------------------------






// Demande de suppression
function onClickDeleteDataBaseFromGestData() {
    if (devMode === true) {console.log("Demande de suppression des données de la base");};

    document.getElementById("divConfirmDeleteDataBase").classList.add("show");

    onChangeDisplay([],[],[],["divGestData","divBtnGestData"],[],[],[]);
}



// Demande de confirmation
function onConfirmDeleteDataBase(event) {
    
    event.stopPropagation();
    if (devMode === true) {console.log("Confirmation de la demande de suppression des données");};

    document.getElementById("divConfirmDeleteDataBase").classList.remove("show");
    onChangeDisplay([],[],[],[],["divGestData","divBtnGestData"],[],[]);

    // Verrouillage des boutons du menu Gestion des données
    onSetLockGestDataButton(true);


    onDeleteBDD();
}



// Annuation de la demande
function onCancelDeleteDataBase(params) {
    if (devMode === true) {console.log("annulation de la demande de suppression des données");};

    document.getElementById("divConfirmDeleteDataBase").classList.remove("show");
    onChangeDisplay([],[],[],[],["divGestData","divBtnGestData"],[],[]);
}





// Fonction de suppression de la base et des favoris
async function onDeleteBDD() {
   
    onDisplayTextDataBaseEvent(true);

    if (devMode === true) {console.log("Lancement de la suppression");};
    // Le local storage
    onDeleteLocalStorage();

    // La base de donnée
    await deleteBase();

    // Relance l'application
    setTimeout(() => {
        location.reload();
    }, 2000);
};

function onDeleteLocalStorage() {
     // Les cookies 
    localStorage.removeItem('MSS_notifyPermission');
    localStorage.removeItem(sessionStorageName);
    localStorage.removeItem(sessionStartTimeStorageName);
}


async function deleteBase() {
    try {
        // Supprimer complètement la base de données (y compris les séquences et métadonnées)
        await new PouchDB(dbName).destroy();
        console.log("[DELETE] La base de données a été complètement supprimée.");
    } catch (error) {
        console.error("[DELETE] Erreur lors de la suppression complète de la base :", error);
    }
}


// ------------------------------------ fonction générales --------------------------





function onSetLockGestDataButton(isDisable) {
    if (devMode === true) {
        console.log("Gestion de blocage ou déblocage des boutons : " + isDisable);
    }

    let buttonArray = [
        "btnExportBdD",
        "fileInputJsonTask",
        "btnImportBdD",
        "btnDeteteBdd",
        "btnReturnFromGestData"
    ];

    buttonArray.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = isDisable;
            el.style.visibility = isDisable ? "hidden" : "visible";
        } else if (devMode === true) {
            console.warn(`[UI] Élément non trouvé : ${id}`);
        }
    });

}



// Evenement patientez pendant la suppression de la base ou son chargement
function onDisplayTextDataBaseEvent(isDelete) {

    let divGestDataRef = document.getElementById("divGestData");

    // Vide la div gestion des données
    divGestDataRef.innerHTML = "";


    // Creation des éléments pour patienter

    let newDiv = document.createElement("div");
    newDiv.className = "center";

    let newImg = document.createElement("img");
    newImg.src = "./Icons/Icon-wait.webp";
    newImg.className = "waiting";

    let newText = document.createElement("p");
    newText.innerHTML =  isDelete ? "Suppression en cours, veuillez patientez... ": "Import en cours ! Veuillez patienter...";
    newText.className = "waiting";


    //text du pourcentage lors de l'import 
    let newPercentText = document.createElement("p");
    newPercentText.classList.add("waiting");
    newPercentText.id = "pPercentImportText";
    newPercentText.textContent = "0%"


    // Insertion
    newDiv.appendChild(newImg);
    newDiv.appendChild(newText);
    newDiv.appendChild(newPercentText);

    divGestDataRef.appendChild(newDiv);
}


// Retour depuis Gestion des données
function onClickReturnFromGestData() {
    // ferme le menu
    onLeaveMenu("GestData");
};