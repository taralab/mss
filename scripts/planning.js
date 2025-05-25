
// Initialisation des variables

let defaultPlanningArray = {
    "lundi" : [],
    "mardi" : [],
    "mercredi" : [],
    "jeudi" : [],
    "vendredi" : [],
    "samedi" : [],
    "dimanche" : []
}

let userPlanningArray = {},
dayReferences = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi"
],
tempPlanningEditorDayItems = [],//temporaire le temps de des manipulations avant enregistrement
currentPlanningDayKey = "",
isUserPlanningLoadedFromBase = false;









// ***************************** CLASS ********************************






// CLASS d'un container d'activité journalier
class EditorActivityItem{
    constructor(dayKey,imgRef,activityName,parentRef){
        this.dayKey = dayKey;
        this.imgRef = imgRef;
        this.activityName = activityName;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("editor-activity-item-content");
        
        this.render();
    };

    render(){
        this.element.innerHTML = `
            <img src="${this.imgRef}" alt="">
            <p>${this.activityName}</p>
            <button onclick="onRemoveActivityInPlanningEditor('${this.activityName}')"><img src="./Icons/Icon-Delete-color.webp" alt=""></button>        
        `;

    // Insertion dans le parent
    this.parentRef.appendChild(this.element);
    }

};


//class du bouton "ajouter une activité"
class ButtonPlanningAddActivity{
    constructor(parentRef){
        this.parentRef = parentRef;
        this.element = document.createElement("button");
        this.element.onclick = () => {
            // Affiche la liste des choix
            document.getElementById("divPlanningActivityChoice").style.display = "flex";            
        }
        this.render();
    }

    render(){
        this.element.innerHTML = `
            <p class="planningEditorPlus">+</p> Ajouter une activité
        `;
        this.parentRef.appendChild(this.element);

    }
}




// ************************************ BdD *****************************************

async function onLoadUserPlanningFromDB() {
    userPlanningArray = {}; // Initialisation en objet

    try {
        const planning = await db.get(planningStoreName).catch(() => null);
        if (planning) {
            userPlanningArray = planning.userPlanning;
        }
        if (devMode === true) {
            console.log("[DATABASE] [PLANNING] loading templateSessionsNameList :", userPlanningArray);
        }
    } catch (err) {
        console.error("[DATABASE] [PLANNING] Erreur lors du chargement:", err);
    }
}






// ******************************** FIN BDD **************************************







async function onOpenMenuPlanning(){

        // La première fois, récupère les templates dans la base
    if (!isUserPlanningLoadedFromBase) {
        await onLoadUserPlanningFromDB();
        isUserPlanningLoadedFromBase = true;
        if (devMode === true){console.log("[PLANNING] 1er chargement des depuis la base")};
    }



    onSetPlanningItems();
};




// Remplit la grille du planning selon la variable
function onSetPlanningItems(){

    let daysWeek = dayReferences[new Date().getDay()];//le jour de la semaine

    Object.keys(userPlanningArray).forEach(key =>{

        // Référence la div du jours de la semaine
        let divWeekDayRef = document.getElementById(`divPlanning_${key}`);

        // traitement css de la div du jours
        if (key === daysWeek){
            divWeekDayRef.classList.add("planning-today");
        }else{
            if (divWeekDayRef.classList.contains("planning-today")) {
                divWeekDayRef.classList.remove("planning-today");
            }
        }


        // Référence le parent des contenus d'activité et reset ses éléments
        let parentActivityAreaRef = document.getElementById(`divPlanningContent_${key}`);
        parentActivityAreaRef.innerHTML = "";

        if (userPlanningArray[key].length > 0) {
            // pour chaque activité du jour concernée
            userPlanningArray[key].forEach(activity => {
                // crée une image
                let newImg = document.createElement("img");
                newImg.src = activityChoiceArray[activity].imgRef;

                // et l'insère
                parentActivityAreaRef.appendChild(newImg);
            });
        }else{
            // si vide, met l'icone de repos
            let newImg = document.createElement("img");
            newImg.src = "./images/icon-repos.webp";
            parentActivityAreaRef.appendChild(newImg);
        }



    })


}





// -------------------    #EDITION journalier ---------------

//La manipulation d'une journée se fait dans un array temporaire
//ensuite lorsque l'utilisateur enregistre, le nouvel état est stocké dans la base et le vrai array






// Click sur un jour
function onEditPlanning(keyTarget) {
    onChangeMenu("PlanningEditor");

    // Génère déjà la liste des activités à choisir
    onGenerateFakePlanningActivityList("divPlanningActivityChoiceList");


    // Traitement du titre
    let title = onSetFirstLetterUppercase(keyTarget);
    document.getElementById("pPlanningEditorTitle").innerHTML = `Activités pour ${title}`;

    // stock les activités du jour séléctionné dans variable temporaire pour manipulation
    tempPlanningEditorDayItems = [...userPlanningArray[keyTarget]],
    currentPlanningDayKey = keyTarget;



    // Lance la fonction de remplissage des items du jours selectionné
    onUpdatePlanningDayEditor(currentPlanningDayKey,tempPlanningEditorDayItems);
}



// remplit l'editeur de planning avec les éléments du jour sélectionné
function onUpdatePlanningDayEditor(keyTarget,activities) {

    // Réference le container parent

    let day = keyTarget,
    parentRef = document.getElementById("divPlanningActivityList");
    parentRef.innerHTML = "";

    if (activities.length > 0) {
        // pour chaque élément du jour
        activities.forEach(activity => {
            let imgRef = activityChoiceArray[activity].imgRef;
            new EditorActivityItem(day,imgRef,activity,parentRef);
        });

    }else{
        // Aucune activité de jour
        parentRef.innerHTML = "Aucune activité programmée !";
    }

    new ButtonPlanningAddActivity(parentRef);

}



// Suppression d'une activité dans une journée
function onRemoveActivityInPlanningEditor(activityToRemove) {
    
    //Retire l'éléménet de l'array temporaire
    let indexToRemove = tempPlanningEditorDayItems.indexOf(activityToRemove);
    tempPlanningEditorDayItems.splice(indexToRemove,1);

    // Réactualise l'affichage
    onUpdatePlanningDayEditor(currentPlanningDayKey,tempPlanningEditorDayItems);


}



function onClickSaveFromPlanningDayEditor() {
    eventSavePlanningDayModification();
}


// sauvegarde des modifications d'une journée
async function eventSavePlanningDayModification() {
    // Actualise le tableau
    userPlanningArray[currentPlanningDayKey] = [...tempPlanningEditorDayItems]

    // quitte le menu
    onLeaveMenu("PlanningEditor");

    // Actualise la base de donnée
    await updateDocumentInDB(planningStoreName, (doc) => {
        doc.userPlanning = userPlanningArray;
        return doc;
    });

    // actualise le planning hebdomadaire
    onSetPlanningItems();

    //popup Notification


}


// Génération de la liste de selection des activités

function onGenerateFakePlanningActivityList(idParentTarget) {
     let parentTargetRef = document.getElementById(idParentTarget);

    // Traite d'abord les favoris
    if (devMode === true){
        console.log("[FAKE SELECTOR]Lancement de la generation des choix des activités");
    };

    parentTargetRef.innerHTML = "";
    let firstFavorisName = "C-A-P"; // Utilisé pour que la première activité favorite, et l'activité identique dans le reste de la liste ai le meme bouton radio


    if (devMode === true){console.log(" [FAKE SELECTOR] ajout des favoris si présent = " + userFavoris.length);};
    userFavoris.sort();

    userFavoris.forEach((e,index)=>{

        // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            eventAddActivityInPlanningDay(e);

        }
    
        // Style sans border botton pour le dernier
        if (index === (userFavoris.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-favourite");
        }
        
        let newFavoriteSymbol = document.createElement("span");
        newFavoriteSymbol.innerHTML = "*";
        newFavoriteSymbol.classList.add("favouriteSymbol");


        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;
    
        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item","fake-opt-item-favoris");
    
    
        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-fav-" + e;
    

        // Effet bouton plein pour le premier favoris
        if (index === 0) {
            newBtnRadioFake.classList.add("selected");
            firstFavorisName = e;
        }
    
        // Insertion
        newContainer.appendChild(newFavoriteSymbol);
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);
    
        parentTargetRef.appendChild(newContainer);
    });


    if (devMode === true){console.log(" [FAKE SELECTOR] ajout du reste des types d'activités")};

    // Puis toutes les types d'activités
    let activitySortedKey = Object.keys(activityChoiceArray);
    activitySortedKey.sort();


    activitySortedKey.forEach((e,index)=>{

        // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            eventAddActivityInPlanningDay(e);

        }
    
        // Style sans border botton pour le dernier
        if (index === (activitySortedKey.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-container");
        }
      
        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;
    
        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item");
    
    
        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-"+e;

        // Effet bouton plein pour l'activité identique au premier favoris
        if (e === firstFavorisName) {
            newBtnRadioFake.classList.add("selected");
        }
    
        // Insertion
    
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);
    
        parentTargetRef.appendChild(newContainer);
    });



}


// Ajout d'une activité à la liste
function eventAddActivityInPlanningDay(activityToAdd) {

    //control de doublon
    if (tempPlanningEditorDayItems.includes(activityToAdd)) {
        alert("Activité déjà existante !");
        return;
    }

    //ajout de l'activité à l'array temporaire
    tempPlanningEditorDayItems.push(activityToAdd);

    // fermeture du popup
    onClosePlanningActivityChoice();

    //actualisation de la journée
    onUpdatePlanningDayEditor(currentPlanningDayKey,tempPlanningEditorDayItems);
}



// Fermeture des choix d'activité
function onClosePlanningActivityChoice() {
    document.getElementById("divPlanningActivityChoice").style.display = "none";
}








function onClickReturnFromPlanningEditor(){

    onLeaveMenu("PlanningEditor");

};





// -------------------    #EDITION journalier FIN ---------------




// QUITTE MENU

// Retour depuis Info
function onClickReturnFromPlanning() {

    // ferme le menu
    onLeaveMenu("Planning");
};

