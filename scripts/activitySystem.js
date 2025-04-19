

// Format de l'objet pour une nouvelle activité
let activityToInsertFormat = {
    name :"",
    date : "",
    location : "",
    distance : "",
    duration : "",
    comment : "",
    createdAt : "",
    isPlanned : false
};


let allUserActivityArray = {}, //Contient toutes les activités créé par l'utilisateur
    userActivityKeysListToDisplay = [], // contient les activités triées et filtrées à afficher
    maxActivityPerCycle = 15,//Nbre d'élément maximale à afficher avant d'avoir le bouton "afficher plus"
    userActivityKeysListIndexToStart = 0, //Index de démarrage pour l'affichage d'activité
    currentActivityDataInView,//contient les données d'une activité en cours d'affichage. Permet de comparer les modifications
    activityTagPlanned  = "planifie",
    activityTagDone = "effectue",
    isActivityPlannedExist = false,
    currentActivityEditorID = "";


// Reférencement

let pInterfaceActivityTitleRef = document.getElementById("pInterfaceActivityTitle"),
    inputDateRef = document.getElementById("inputDate"),
    inputLocationRef = document.getElementById("inputLocation"),
    inputDistanceRef = document.getElementById("inputDistance"),
    inputDurationActivityHoursRef = document.getElementById("inputDurationActivityHours"),
    inputDurationActivityMinutesRef = document.getElementById("inputDurationActivityMinutes"),
    inputDurationActivitySecondsRef = document.getElementById("inputDurationActivitySeconds"),
    textareaCommentRef = document.getElementById("textareaComment"),
    selectorCategoryChoiceRef = document.getElementById("selectorCategoryChoice"),
    divItemListRef = document.getElementById("divItemList"),
    imgEditorActivityPreviewRef = document.getElementById("imgEditorActivityPreview"),
    inputIsPlannedRef = document.getElementById("inputIsPlanned"),
    pEditorActivityPreviewPlannedIconRef = document.getElementById("pEditorActivityPreviewPlannedIcon");




// Genere la liste pour l'editeur d'activité
onGenerateActivityOptionChoice("selectorCategoryChoice");
onGenerateFakeOptionList("divFakeSelectOptList");




// class ActivityItem

class ActivityItem {
    constructor(id, imgRef, itemContainerClass, distance, duration, date, location, comment, commentClass, distanceClass, durationClass, attribute, parentRef, isPlanned) {
        this.id = id;
        this.imgRef = imgRef;
        this.itemContainerClass = itemContainerClass;
        this.distance = distance;
        this.duration = duration;
        this.date = date;
        this.location = location;
        this.comment = comment;
        this.commentClass = commentClass;
        this.distanceClass = distanceClass;
        this.durationClass = durationClass;
        this.attribute = attribute;
        this.parentRef = parentRef;
        this.isPlanned = isPlanned;

        // Conteneur principal
        this.element = document.createElement("div");
        this.itemContainerClass.forEach(cls => this.element.classList.add(cls));//parce ce que itemContainerClass est un array
        this.element.onclick = () => {
            onClickOnActivity(this.id);
        };

        this.render();
    }

    render() {
        const distance = this.distance ? `${this.distance} km` : "---";
        const location = this.location ? this.location : "---";
        const date = onDisplayUserFriendlyDate(this.date);

        this.element.innerHTML = `
            <div class="item-image-container">
                <img class="activity" src="${this.imgRef}">
            </div>
            <div class="item-data-container">
                <div class="item-data-area1">
                    <p class="${this.distanceClass}">${distance}</p>
                    <p class="${this.durationClass}">${this.duration}</p>
                    <p class="item-data-date">${date}</p>
                </div>
                <div class="item-data-area2">
                    <p class="item-data-location">${location}</p>
                    ${this.isPlanned ? `<button class="buttonAddCalendar">🗓️</button>` : ""}
                </div>
                <div class="item-data-area3">
                    <p data-type="${this.attribute}" class="${this.commentClass}">${this.comment}</p>
                </div>
            </div>
        `;

        // Ajout du bouton ICS s’il est présent
        if (this.isPlanned) {
            const btnICS = this.element.querySelector(".buttonAddCalendar");
            if (btnICS) {
                btnICS.addEventListener("click", (event) => {
                    event.stopPropagation(); // pour ne pas déclencher le clic sur l’item
                    onClickAddToCalendar(this.id);
                });
            }
        }

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }
}






// ------------------------------Fonction générale pour activity ----------------------------------


// fonction pour récupérer les activité et les modèles
async function onLoadActivityFromDB() {
    allUserActivityArray = {}; // devient un objet
    try {
        const result = await db.allDocs({ include_docs: true });

        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === activityStoreName)
            .forEach(doc => {
                allUserActivityArray[doc._id] = { ...doc }; // on garde tout
            });

        if (devMode === true) {
            console.log("[DATABASE] [ACTIVITY] Activités chargées :", activityStoreName);
            const firstKey = Object.keys(allUserActivityArray)[0];
            console.log(allUserActivityArray[firstKey]);
        }
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors du chargement:", err);
    }
}




// Insertion nouvelle activité (ID auto, )
async function onInsertNewActivityInDB(activityToInsertFormat) {
    try {
        const newActivity = {
            type: activityStoreName,
            ...activityToInsertFormat
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newActivity);

        // Mise à jour de l’objet avec _id et _rev retournés
        newActivity._id = response.id;
        newActivity._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [ACTIVITY] Activité insérée :", newActivity);
        }

        return newActivity;
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors de l'insertion de l'activité :", err);
    }
}


// Modification Activity
async function onInsertActivityModificationInDB(activityToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de activityToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeActivityUpdate } = activityToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeActivityUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[ACTIVITY] Activité mise à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return false; // Indique que la mise à jour a échoué
    }
}

// Suppression template
async function deleteActivity(activityKey) {
    try {
        // Récupérer le document à supprimer
        let docToDelete = await db.get(activityKey);

        // Supprimer le document
        await db.remove(docToDelete);

        if (devMode === true ) {console.log("[ACTIVITY] Activité supprimée :", activityKey);};

        return true; // Indique que la suppression s'est bien passée
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la suppression de l'activité :", err);
        return false; // Indique une erreur
    }
}


// Recherche de template par son id/key
async function findActivityById(activityId) {
    try {
        const activity = await db.get(activityId); // Recherche dans la base
        if (devMode) console.log("[ACTIVITY] Activité trouvé :", activity);
        currentActivityEditorID = activityId;
        return activity; // Retourne l'objet trouvé
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la recherche du template :", err);
        return null; // Retourne null si non trouvé
    }
}



// Fonction de recherche d'une activité dans AllUserActivityArray.
function onSearchActivity(keyRef) {
    if (devMode === true){console.log("Affichage de l'activité dans 'AllUserActivityArray' avec la key :  " + keyRef);};
    return allUserActivityArray.find(activity => activity._id === keyRef);
}




// ------------------------------FIN fonction générale pour activity ----------------------------------







function onOpenNewActivity() {

    activityEditorMode = "creation";
    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};

    // Initialise les éléments
    onResetActivityInputs();
    
};

function onOpenNewActivityFromTemplate(templateItem) {
    // Initialise les éléments
    onResetActivityInputs();
    onSetBtnRadio(templateItem.activityName);

    activityEditorMode = "creation";

    if (devMode === true){
        console.log("ouverture de l'editeur d'activité depuis un template en mode " + activityEditorMode);
        console.log("Valeur de templateItem : ");
        console.log(templateItem);
    };


    


    //Set avec le élément du template
    inputLocationRef.value = templateItem.location;
    inputDistanceRef.value = templateItem.distance;
    textareaCommentRef.value = templateItem.comment;
    inputIsPlannedRef.checked = templateItem.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(templateItem.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;


    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = templateItem.activityName;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[templateItem.activityName].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = templateItem.isPlanned ? "🗓️ Cette activité est planifiée.":"";
}


// Reset les inputs du menu activité
function onResetActivityInputs() {
    if (devMode === true){console.log("reset les inputs du menu activité");};
    inputDateRef.value = "";
    inputLocationRef.value = "";
    inputDistanceRef.value = "";
    inputDurationActivityHoursRef.value = "00";
    inputDurationActivityMinutesRef.value = "00";
    inputDurationActivitySecondsRef.value = "00";
    textareaCommentRef.value = "";
    inputIsPlannedRef.checked = false;

    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = userFavoris.length > 0 ? userFavoris[0] : "C-A-P";
   
    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = userFavoris.length > 0 ? activityChoiceArray[userFavoris[0]].imgRef  : activityChoiceArray["C-A-P"].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = "";

    inputDateRef.classList.remove("fieldRequired");
};



// Empêche d'utiliser une date ultérieure (non utilisé actuellement)

function initMaxDate() {

    if (devMode === true){console.log("Blocage de la date maximale à ");};
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    inputDateRef.setAttribute('max', formattedDate);

    if (devMode === true){console.log("Blocage de la date maximale à " + formattedDate);};

}





// Insertion des activités dans la liste

function onInsertActivityInList(activityKeysToDisplay) {

    // Stock les activité à afficher dans un tableau
    userActivityKeysListToDisplay = activityKeysToDisplay;
    userActivityKeysListIndexToStart = 0;


    if (devMode === true){
        console.log("nbre d'activité total à afficher = " + userActivityKeysListToDisplay.length);
        console.log("Nbre max d'activité affiché par cycle = " + maxActivityPerCycle);
        console.log("Vide la liste des activités");
    };

    divItemListRef.innerHTML = "";

    if (userActivityKeysListToDisplay.length === 0) {
        divItemListRef.innerHTML = "Aucune activité à afficher !";
        return
    }else{
        if (devMode === true){console.log("Demande d'insertion du premier cycle d'activité dans la liste");};
        onInsertMoreActivity();
    };


};



// séquence d'insertion  d'activité dans la liste selon le nombre limite définit
function onInsertMoreActivity() {
    if (devMode === true){console.log("Lancement d'un cycle d'insertion d'activité.");};
    let cycleCount = 0;

    if (devMode === true){console.log("Index de départ = " + userActivityKeysListIndexToStart);};



    for (let i = userActivityKeysListIndexToStart; i < Object.keys(userActivityKeysListToDisplay).length; i++) {

        if (cycleCount >= maxActivityPerCycle) {
            if (devMode === true){console.log("Max par cycle atteinds = " + maxActivityPerCycle);};
            // Creation du bouton More
            onCreateMoreActivityBtn();
            userActivityKeysListIndexToStart += maxActivityPerCycle;
            if (devMode === true){console.log("mise a jour du prochain index to start = " + userActivityKeysListIndexToStart);};
            // Arrete la boucle si lorsque le cycle est atteind
            return
        }else{
            onInsertOneActivity(allUserActivityArray[userActivityKeysListToDisplay[i]],i === Object.keys(userActivityKeysListToDisplay).length-1);
        };
        cycleCount++;
    };

    
};




// Fonction d'insertion d'une activité dans la liste avec gestion spécial pour le dernier element
// et gestion pour les activités planifiées
function onInsertOneActivity(activity,isLastIndex) {


    let containerClass = activity.isPlanned ? ["item-container", "item-planned"]: ["item-container"],
        imageRef = activityChoiceArray[activity.name].imgRef,
        distanceClass = activity.isPlanned ? "item-data-distance-planned" : "item-data-distance",
        durationClass = activity.isPlanned ? "item-data-duration-planned" : "item-data-duration",
        commentClass = activity.isPlanned ? currentCommentPlannedClassName : currentCommentDoneClassName,
        attribute = activity.isPlanned ? activityTagPlanned : activityTagDone;

    new ActivityItem(
        activity._id,imageRef,
        containerClass,
        activity.distance,
        activity.duration,
        activity.date,
        activity.location,
        activity.comment,
        commentClass,distanceClass,durationClass,
        attribute,
        divItemListRef,
        activity.isPlanned
    );
    

    // gestion derniere activité de la liste
    // Insertion d'un trait en fin de liste
    if (isLastIndex) {
        let newClotureList = document.createElement("span");
        newClotureList.classList.add("last-container");
        newClotureList.innerHTML = "ℹ️ Vos activités sont stockées dans votre navigateur.";
        divItemListRef.appendChild(newClotureList);
    }
};


// Fonction pour le bouton MoreActivity pour afficher les activités utilisateurs suivantes

function onCreateMoreActivityBtn() {


    // La div de l'item
    let newItemContainerBtnMore = document.createElement("div");
    newItemContainerBtnMore.classList.add("moreItem");
    newItemContainerBtnMore.id = "btnMoreItem";

    newItemContainerBtnMore.onclick = function (){
        onDeleteBtnMoreItem();
        onInsertMoreActivity();
    };


    let newTextBtnMore = document.createElement("p");
    newTextBtnMore.classList.add("moreItem");
    newTextBtnMore.innerHTML = "Afficher plus d'activités";

    // Insertion


    newItemContainerBtnMore.appendChild(newTextBtnMore);

    divItemListRef.appendChild(newItemContainerBtnMore);

};




// Fonction pour supprimer le bouton "more item"
function onDeleteBtnMoreItem() {
    // Sélection de l'élément avec l'ID "liToto"
    let btnToDelete = document.getElementById("btnMoreItem");
    
    // Vérification si l'élément existe avant de le supprimer
    if (btnToDelete) {
        btnToDelete.remove();
        if (devMode === true){console.log("Suppression du bouton More Item");};
    } else {
        if (devMode === true){console.log("Le bouton more item n'est pas trouvé");};
    };
};














// ---------------------------------  EDITEUR d'activité ---------------------

// Variable pour connaitre dans quel mode l'editeur d'activité est ouvert
let activityEditorMode; //  creation, modification, 











function onClickReturnFromActivityEditor() {
    onLeaveMenu("Activity");
};






function onClickSaveFromActivityEditor() {
    // Verrouillage de la div pour éviter double clic et créer des problèmes
    onLockDivDoubleClick(["divActivityEditor","divBtnActivity"]);
    // Lancement du formatage de l'activité
    onFormatActivity();
};



// Set l'image de prévisualisation d'activité dans l'éditeur
function onChangeActivityPreview(dataName) {
    if (devMode === true){console.log(dataName);};
    imgEditorActivityPreviewRef.src = activityChoiceArray[dataName].imgRef;
} 

// Set l'icone "temporaire" dans la prévisualisation
function onChangeActivityPlanned(checkBoxValue) {
    pEditorActivityPreviewPlannedIconRef.innerHTML = checkBoxValue ? "🗓️ Cette activité est planifiée.":"";
}




// ------------------------------------- Modification d'activité --------------------------------





// clique sur un item
function onClickOnActivity(keyRef) {
    onResetActivityInputs();

    currentActivityEditorID = keyRef;

    let activityToDisplay = allUserActivityArray[keyRef];

    currentActivityDataInView = activityToDisplay;//pour la comparaison par la suite
    onEditActivity(activityToDisplay);

    onChangeMenu("EditActivity");
};






function onEditActivity(activityTarget) {

    // Set le mode d'edition de l'activité
    activityEditorMode = "modification";
    // Set les boutons radio
    onSetBtnRadio(activityTarget.name);

    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};

    selectorCategoryChoiceRef.value = activityTarget.name;
    inputDateRef.value = activityTarget.date;
    inputLocationRef.value = activityTarget.location;
    inputDistanceRef.value = activityTarget.distance;
    textareaCommentRef.value = activityTarget.comment;
    inputIsPlannedRef.checked = activityTarget.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(activityTarget.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[activityTarget.name].imgRef;
    // prévisualisation coché temporaire
    pEditorActivityPreviewPlannedIconRef.innerHTML = activityTarget.isPlanned ? "🗓️ Cette activité est planifiée." : "";
};



// -------------------------- Création d'activité ---------------------------------








// formatage de la nouvelle activité avant insertion dans la base
function onFormatActivity() {


    if (activityEditorMode === "creation") {
        if (devMode === true){console.log("Demande de création nouvelle activité");};
    }else if(activityEditorMode === "modification"){
        if (devMode === true){console.log("Demande d'enregistrement d'une modification d'activité");};
    };
    



    // Verification des champs requis
    if (devMode === true){console.log("[ NEW ACTIVITE ] controle des champs requis");};
    let emptyField = onCheckEmptyField(inputDateRef.value);

    if (emptyField === true) {
        if (devMode === true){console.log("[ NEW ACTIVITE ] Champ obligatoire non remplis");};

        inputDateRef.classList.add("fieldRequired");
        onUnlockDivDoubleClick(["divActivityEditor","divBtnActivity"]);//retire la sécurité du clic
        return
    };



    //  met tous les éléments dans l'objet
    activityToInsertFormat.name = selectorCategoryChoiceRef.value;
    activityToInsertFormat.date = inputDateRef.value;
    activityToInsertFormat.distance = inputDistanceRef.value;
    activityToInsertFormat.location = onSetToUppercase(inputLocationRef.value);
    activityToInsertFormat.comment = textareaCommentRef.value;
    activityToInsertFormat.duration = inputActivityNumberToTime();

    // Ne set la date de création que lors d'une création et non lors d'une modification
    if (activityEditorMode === "creation") {
        activityToInsertFormat.createdAt = new Date().toISOString();
    }else {
        activityToInsertFormat.createdAt = currentActivityDataInView.createdAt;
    };

    


    // Gestion planification  : les dates après la date du jour sont obligatoirement des activités planifiées
    // si date ultérieur automatiquement planifié sinon, regarde la valeur checkbox
    //ATTENTION : "Aujourd'hui" comment à partir d'1 heure du matin pour l'application
    const isPlannedBySystem = isDateAfterToday(inputDateRef.value);
    activityToInsertFormat.isPlanned = isPlannedBySystem ? true : inputIsPlannedRef.checked;


    // Demande d'insertion dans la base soit en creation ou en modification


    if (activityEditorMode === "creation") {
        eventInsertNewActivity(activityToInsertFormat,false);
    }else if(activityEditorMode === "modification"){
        onCheckIfModifiedRequired(activityToInsertFormat);
    };

};


// Sauvegarde uniquement si une modification a bien été effectuée dans les données
function onCheckIfModifiedRequired(activityToInsertFormat) {
    
    // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: currentActivityDataInView.name, newValue: activityToInsertFormat.name },
        { oldValue: currentActivityDataInView.date, newValue: activityToInsertFormat.date },
        { oldValue: currentActivityDataInView.distance, newValue: activityToInsertFormat.distance },
        { oldValue: currentActivityDataInView.location, newValue: activityToInsertFormat.location },
        { oldValue: currentActivityDataInView.comment, newValue:  activityToInsertFormat.comment },
        { oldValue: currentActivityDataInView.duration, newValue:  activityToInsertFormat.duration },
        { oldValue: currentActivityDataInView.isPlanned, newValue:  activityToInsertFormat.isPlanned }
    ];

    if (devMode) {
        fieldsToCompare.forEach(e=>{
            console.log(e);
        });
    };

    // Vérification si une différence est présente
    // some s'arrete automatiquement si il y a une différence
    // Vérification si une différence est présente
    const updateDataRequiered = fieldsToCompare.some(field => {
        if (typeof field.oldValue === "object" && field.oldValue !== null) {
            // Utiliser JSON.stringify pour comparer les contenus des objets
            return JSON.stringify(field.oldValue) !== JSON.stringify(field.newValue);
        }
        // Comparaison simple pour les types primitifs
        return field.oldValue != field.newValue;
    });


    if (updateDataRequiered) {
        if (devMode) console.log("[ACTIVITY] Informations d'activité différentes : Lancement de l'enregistrement en BdD");
        eventInsertActivityModification(activityToInsertFormat);
    } else {
        if (devMode) console.log("[ACTIVITY] Aucune modification de d'activité nécessaire !");
         //Gestion de l'affichage 
        onLeaveMenu("Activity");
    }

}







// retrait de l'indication de champ obligatoire si activé, lorsque l'utilisateur
//  modifie quelque chose dans le champ date
function onInputDateChange() {

    if (inputDateRef.classList.contains("fieldRequired")) {
        inputDateRef.classList.remove("fieldRequired");
    }
    
}



// Séquence d'insertion d'une nouvelle activité
//Soi depuis l'éditeur d'activité, soit une activité généré depuis les sessions

async function eventInsertNewActivity(dataToInsert,isFromSession) {

    // Insere en base
    let newActivityToAdd = await onInsertNewActivityInDB(dataToInsert);

    // Insère également dans l'array d'objet
    allUserActivityArray[newActivityToAdd._id] = newActivityToAdd;
    if (devMode === true){console.log(allUserActivityArray);};



    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);


    // Si c'est une activité généré depuis les session, met fin à la fonction
    if (isFromSession) {
        // Popup notification
        onShowNotifyPopup(notifyTextArray.activityGenerated);
        return
    }

    // Popup notification
    onShowNotifyPopup(notifyTextArray.creation);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}



// Séquence d'insertion d'une modification
async function eventInsertActivityModification(dataToInsert) {

    // Sauvegarde dans la base
    let activityUpdated = await onInsertActivityModificationInDB(dataToInsert,currentActivityEditorID);

    // met à jour l'array d'objet
    allUserActivityArray[currentActivityEditorID] = activityUpdated;
    if (devMode === true){console.log(allUserActivityArray);};

    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);

    // Popup notification
    onShowNotifyPopup(notifyTextArray.modification);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}





// --------------------- SUPPRESSION ACTIVITE --------------------------


// Suppression d'activité
function onClickDeleteFromActivityEditor() {
    
    if (devMode === true){console.log("demande de suppression d'activité ");};
    // L'affiche de la div doit se faire en "flex" donc je n'utilise pas le onChangeDisplay
    document.getElementById("divConfirmDeleteActivity").classList.add("show");

    onChangeDisplay([],[],[],["divActivityEditor","divBtnActivity"],[],[],[]);

};


function onConfirmDeleteActivity(event){

    event.stopPropagation();// Empêche la propagation du clic vers la div d'annulation

    onLockDivDoubleClick(["divActivityEditor","divBtnActivity"]);//sécurité double click

    if (devMode === true){console.log("Confirmation de suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    document.getElementById("divConfirmDeleteActivity").classList.remove("show");
    eventDeleteActivity(currentActivityEditorID);


};


// Sequence de suppression d'un template
async function eventDeleteActivity(idToDelete) {

    // Supprime en base
    await deleteActivity(idToDelete);
    
    // met à jour l'array d'objet
    delete allUserActivityArray[idToDelete];

    if (devMode === true){console.log(allUserActivityArray);};

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);

    // Popup notification
    onShowNotifyPopup(notifyTextArray.delete);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");

}







function onAnnulDeleteActivity(event) {
    
    if (devMode === true){console.log("annulation de la suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    document.getElementById("divConfirmDeleteActivity").classList.remove("show");
    onChangeDisplay([],[],[],[],["divActivityEditor","divBtnActivity"],[],[]);

};





// gestion du format des heures en passe par des inputs number






// Fonction récupérer les valeur des inputs number et les convertir au format input time
function inputActivityNumberToTime() {

    let hhh = inputDurationActivityHoursRef.value.padStart(2, '0');
    let mm = inputDurationActivityMinutesRef.value.padStart(2, '0');
    let ss = inputDurationActivitySecondsRef.value.padStart(2, '0');

    // Mettre à jour l'affichage dans le champ text
    return `${hhh}:${mm}:${ss}`;
}




