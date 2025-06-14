//contient la liste des noms et id des modèles de session
let templateSessionsNameList = {
        // "id1":{name:"saucisse"},
        // "id2":{name:"tomate"}
    },
    templateSessionKeys = [],
    isTemplateSessionLoadedFromBase = false,//pour une premier chargement via la base de donnée
    maxTemplateSession = 20,
    templateSessionEditorMode = "", // le mode d'ouverture de l'éditeur (creation,modification)
    currentTemplateSessionID = "",
    currentTemplateSessionData;//pour comparer si ça a été modifié ou non






// ------------------------ Fonction générales ----------------------------------------------------





// Insertion nouveau activity (session de template) avec ID auto
async function onInsertNewTemplateSessionInDB(templateSessionToInsert) {
    try {
        // Ajoute le "type" aux données
        const newTemplateSession = {
            type: templateSessionStoreName,
            ...templateSessionToInsert
        };

        // Insérer avec post() pour générer un ID auto
        const response = await db.post(newTemplateSession);

        // Ajouter les métadonnées pour renvoi
        newTemplateSession._id = response.id;
        newTemplateSession._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [TEMPLATE] [SESSION] modèle de session inséré :", newTemplateSession);
        }

        return newTemplateSession;
    } catch (err) {
        console.error("[DATABASE] [TEMPLATE] [SESSION] Erreur lors de l'insertion du modèle de session :", err);
    }
}


// Modification template
async function onInsertTemplateSessionModificationInDB(templateToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de templateToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeTemplateUpdate } = templateToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeTemplateUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[TEMPLATE SESSION] Template session mis à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour du template session :", err);
        return false; // Indique que la mise à jour a échoué
    }
}

async function onLoadTemplateSessionNameFromDB() {
    templateSessionsNameList = {}; // Initialisation en objet

    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer et extraire uniquement les champs nécessaires sous forme de tableau
        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === templateSessionStoreName)
            .forEach(doc => {
                templateSessionsNameList[doc._id] = {name:doc.sessionName};
            });

        if (devMode === true) {
            console.log("[DATABASE] [TEMPLATE] [SESSION] loading templateSessionsNameList :", templateSessionsNameList);
        }
    } catch (err) {
        console.error("[DATABASE] [TEMPLATE] [SESSION] Erreur lors du chargement:", err);
    }
}



// Actualisation des keys et classement par ordre alpha selon le champ name
function onUpdateAndSortTemplateSessionKey() {


    // Récupère les clés
    templateSessionKeys = Object.keys(templateSessionsNameList);

    if (devMode === true) {
        console.log("actualisation et trie");
        console.log("templateSessionsNameList:",templateSessionsNameList);
        console.log(templateSessionKeys);
    };


    // Trie les clés par ordre alphabétique sur le champ "name"
    templateSessionKeys.sort((a, b) =>
        templateSessionsNameList[a].name.localeCompare(
            templateSessionsNameList[b].name,
            'fr',
            { sensitivity: 'base' }
        )
    );
}

// Suppression template
async function deleteTemplateSession(templateKey) {
    try {
        // Récupérer le document à supprimer
        let docToDelete = await db.get(templateKey);

        // Supprimer le document
        await db.remove(docToDelete);

        if (devMode === true ) {console.log("[TEMPLATE] Template supprimé :", templateKey);};

        return true; // Indique que la suppression s'est bien passée
    } catch (err) {
        console.error("[TEMPLATE] Erreur lors de la suppression du template session :", err);
        return false; // Indique une erreur
    }
}



// Recherche de template de session par son id/key
async function findTemplateSessionById(templateId) {
    try {
        const template = await db.get(templateId); // Recherche dans la base
        if (devMode) console.log("Template trouvé :", template);
        return template; // Retourne l'objet trouvé
    } catch (err) {
        console.error("Erreur lors de la recherche du template :", err);
        return null; // Retourne null si non trouvé
    }
}

// class d'une div de modèle de session à inserer dans la liste
class TemplateSessionItemList {
    constructor(id,sessionName,parentRef,delayMs = 0,animationEnabled = true){
        this.id = id;
        this.sessionName = sessionName;
        this.parentRef = parentRef;
        this.delayMs = delayMs;
        this.animationEnabled = animationEnabled;

        this.element = document.createElement("div");
        this.element.classList.add("item-template-container");


        // Animation (si activé)
        if (this.animationEnabled) {
            // Pour l'animation sur le conteneur principal
            this.element.classList.add("item-animate-in-horizontal");
            this.element.style.animationDelay = `${this.delayMs}ms`;


            // evenement pour retirer l'animation après qu'elle soit jouée
            this.element.addEventListener("animationend", () => {
                this.element.classList.remove("item-animate-in-horizontal");
                this.element.style.animationDelay = "";
            }, { once: true });
        }

        // Utilisation d'une fonction fléchée pour conserver le bon "this"
        this.element.onclick = () => {
            currentTemplateSessionID = this.id;
            onChangeMenu("ModifyTemplateSession");
            eventOpenTemplateSessionEditor("modification");
        };

        this.render();
    }


    render(){
        this.element.innerHTML = `
            <span>${this.sessionName}</span>
        `;

        //insertion dans le parent
        this.parentRef.appendChild(this.element);
    };
}









// ------------------------ FIN Fonction générales ----------------------------------------------------






async function onOpenMenuTemplateSession() {

    // La première fois, récupère les templates dans la base
    if (!isTemplateSessionLoadedFromBase) {
        await onLoadTemplateSessionNameFromDB();
        isTemplateSessionLoadedFromBase = true;
        if (devMode === true){console.log("1er chargement des templates session depuis la base")};
    }

    // Actualisation de la liste d'affichage
    eventUpdateTemplateSessionList();
    
}




// Sequence d'actualisation de la liste d'affichage des modèles de session

async function eventUpdateTemplateSessionList() {

    // Récupère les keys et les tries
    onUpdateAndSortTemplateSessionKey();

    if (devMode === true){console.log("templateSessionsNameList:",templateSessionsNameList);};

    // Affiche la liste des modèles de sessions
    onSetTemplateSessionNameList();
}




// actualise la liste des modèles de session
function onSetTemplateSessionNameList() {
    
    // Récupère le parent et le vide
    let parentRef = document.getElementById("divTemplateSessionListMenu");
    parentRef.innerHTML = "";   
    let divSessionTemplateEndListRef = document.getElementById("divSessionTemplateEndList");
    divSessionTemplateEndListRef.innerHTML = "";

    // remonte le scroll
    onResetScrollBarToTop("divMenuTemplateSession");

    //Affichage si aucun modèle de session
    if (templateSessionKeys.length === 0 ) {
       parentRef.innerHTML = "Aucun modèle à afficher !";

        // Insertion du bouton ajouter
        new Button_add("Ajouter un modèle", () => onChangeMenu('NewTemplateSession'), false,divSessionTemplateEndListRef);

       return;
    }

    // Pour chaque ligne dans le tableau
    templateSessionKeys.forEach((key,index)=>{
        // Crée une div
        let delay = index * animCascadeDelay; // 60ms d’écart entre chaque élément : effet cascade
        new TemplateSessionItemList(key,templateSessionsNameList[key].name,parentRef,delay,userSetting.animationEnabled);

        // Creation de la ligne de fin pour le dernier index
        if (index === (Object.keys(templateSessionsNameList).length - 1)) {

            // Insertion du bouton ajouter et traitement état désactivation
            let btnIsDisabled = templateSessionKeys.length >= maxTemplateSession;
            new Button_add("Ajouter un modèle", () => onChangeMenu('NewTemplateSession'), btnIsDisabled, divSessionTemplateEndListRef);

            // Ligne de cloture
            let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Vous pouvez créer jusqu'à ${maxTemplateSession} modèles.`;
            divSessionTemplateEndListRef.appendChild(newClotureList);
        }
    });

}





// Quitte le menu principal
function onClickReturnFromMenuTemplateSession() {

    //vide le tableau
    document.getElementById("bodyTableGenerateSessionEditor").innerHTML = "";

    onLeaveMenu("MenuTemplateSession");
}









// ----------------------------------------- editeur de modèle de session-------------------------------------------------










// lance d'éditeur de sesion

function onClickBtnCreateTemplateSession(){

    // Demande l'ouverture de l'éditeur en paramétrant le mode
    eventOpenTemplateSessionEditor("creation");

};



// Sequence d'ouverture de l'editeur de modele de session selon le mode choisi(creation ou modification)

async function eventOpenTemplateSessionEditor(mode){

    // Enlève la notification de champ obligatoire si présent
    document.getElementById("inputTemplateSessionName").classList.remove("fieldRequired");

    // Enregistre le mode d'ouverture
    templateSessionEditorMode = mode;

    switch (templateSessionEditorMode) {
        case "creation":
            // Demande de création du tableau vide
            onCreateTemplateSessionTableLine();
            break;
        case "modification":
            // Demande de création du tableau vide
            onCreateTemplateSessionTableLine();

            // Recherche les éléments dans la base
            let result = await findTemplateSessionById(currentTemplateSessionID);
            currentTemplateSessionData = {
                sessionName :result.sessionName,
                counterList: result.counterList
            };
            // Puis remplit le tableau 
            onSetTemplateSessionTableLine(currentTemplateSessionData);
            break;
    
        default:
            break;
    }

}




// fonction de génération des lignes du tableau
function onCreateTemplateSessionTableLine() {
    
    // Reférence le parent
    let parentRef = document.getElementById("bodyTableGenerateSessionEditor");

    // Reset le contenu du parent et le nom
    parentRef.innerHTML = "";
    document.getElementById("inputTemplateSessionName").value = "";

    // Génère le tableau
    for (let i = 0; i < maxCounter; i++) {
        new TableLineSession(parentRef,i); 
    }
}

// Fonction pour remplir les lignes du tableau
function onSetTemplateSessionTableLine(templateData) {
    if (devMode === true){console.log(templateData)};

    // Set le nom de la session
    document.getElementById("inputTemplateSessionName").value = templateData.sessionName;

    //Boucle pour remplir les différents compteurs
    templateData.counterList.forEach((counter,index)=>{
        document.getElementById(`inputGenSessionNom_${index}`).value = counter.counterName;
        document.getElementById(`inputGenSessionSerie_${index}`).value = counter.serieTarget;
        document.getElementById(`inputGenSessionRep_${index}`).value = counter.repIncrement;
        // Couleur
        document.getElementById(`selectGenSessionColor_${index}`).value = counter.color;
        onChangeColorInGenSessionTable(index);
    }); 
    
    
}


async function onClickSaveFromTemplateSessionEditor() {

    // Controle titre obligatoire
    let inputTemplateSessionNameRef = document.getElementById("inputTemplateSessionName");
    let isTemplateTitleSet  = onCheckEmptyField(inputTemplateSessionNameRef);

    // Si condition non remplit, met fin à la fonction
    if (isTemplateTitleSet) {
        if (devMode === true){console.log("[ TEMPLATE SESSION ] Champ obligatoire non remplis");};

        return
    }


    // Masque le popup
    onLeaveMenu("TemplateSessionEditor");

    // Récupère les éléments de la liste
    let newCounterList = onGetTableTemplateSessionItem();

    // Récupère le nom du modele
    let templateSessionName = inputTemplateSessionNameRef.value;

    let templateSessionTosave = {
        sessionName: templateSessionName,
        counterList : newCounterList
    }
    if (devMode === true){console.log(templateSessionTosave);};


    // Filtre selon le type du mode d'éditeur

    switch (templateSessionEditorMode) {
        case "creation":    
            // Sauvegarde la création
            let templateAdded = await onInsertNewTemplateSessionInDB(templateSessionTosave);

            // Ajoute également à la variable
            templateSessionsNameList[templateAdded._id] = {name: templateAdded.sessionName};


        if (devMode === true) {console.log("templateSessionsNameList:",templateSessionsNameList);};

            // Notification
            onShowNotifyPopup("templateCreation");
            break;
        case "modification":
            // Sauvegarde la modification
            await  onInsertTemplateSessionModificationInDB(templateSessionTosave,currentTemplateSessionID);

            // Modifie également à la variable
            templateSessionsNameList[currentTemplateSessionID] = {name: templateSessionTosave.sessionName};
            if (devMode === true) {console.log("templateSessionsNameList:",templateSessionsNameList);};

            // Notification
            onShowNotifyPopup("templateModification");
            break;
    
        default:
            break;
    }


    // actualise la liste des templates
    eventUpdateTemplateSessionList();
    
}








// Fonction pour récupérer le contenu du tableau de création de modele de session
function onGetTableTemplateSessionItem() {
    let counterList = [];

    for (let i = 0; i < maxCounter; i++) {

        // Reférence les éléments
        inputName = document.getElementById(`inputGenSessionNom_${i}`);
        inputSerie = document.getElementById(`inputGenSessionSerie_${i}`);
        inputRep = document.getElementById(`inputGenSessionRep_${i}`);
        selectColor = document.getElementById(`selectGenSessionColor_${i}`);

        // Si inputName remplit
        if (inputName.value != "") {

            // récupère les éléments de la ligne 
            counterList.push( {
                counterName: inputName.value, 
                serieTarget: parseInt(inputSerie.value) || 0,
                repIncrement: parseInt(inputRep.value) || 0,
                color : selectColor.value
            })
        } 
    }

    return counterList;
}




// -------------------------------- SUPPRIMER -------------------------------


function onClickDeleteFromTemplateSessionEditor() {
    onSetSessionPopupMode("deleteTemplateSession");
}




// Sequence de suppression d'un modèle
async function eventDeleteTemplateSessionModel() {
    
    // ferme l'editeur
    onLeaveMenu("TemplateSessionEditor");


    // supprime en base
    await deleteTemplateSession(currentTemplateSessionID);

    //supprime également dans la variable
    delete templateSessionsNameList[currentTemplateSessionID];

    if (devMode === true) {console.log("templateSessionsNameList:",templateSessionsNameList);};

    // Notification
    onShowNotifyPopup("templateDeleted");

    // Actualise la liste
    eventUpdateTemplateSessionList();

}



// Quitte l'éditeur de modèle de session
function onClickReturnFromTemplateSessionEditor() {

    //vide le tableau
    document.getElementById("bodyTableGenerateSessionEditor").innerHTML = "";

    onLeaveMenu("TemplateSessionEditor");
}


