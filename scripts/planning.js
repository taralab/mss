
// Initialisation des variables
let userPlanningArray = {
    "lundi" : ["MUSCULATION","ETIREMENT"],
    "mardi" : ["C-A-P"],
    "mercredi" : ["MUSCULATION"],
    "jeudi" : ["VELO","ETIREMENT"],
    "vendredi" : ["NATATION"],
    "samedi" : ["RENFORCEMENT"],
    "dimanche" : []
},
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
currentPlanningDayKey = "";

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
        this.element.onclick = () =>{
            onRemoveActivityInPlanningEditor(this.dayKey,activityName);
        };
        
        this.render();
    };

    render(){
        this.element.innerHTML = `
            <img src="${this.imgRef}" alt="">
            <p>${this.activityName}</p>
            <button><img src="./Icons/Icon-Delete-color.webp" alt=""></button>        
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

        this.render();
    }

    render(){
        this.element.innerHTML = `
            <p class="planningEditorPlus">+</p> Ajouter une activité
        `;
        this.parentRef.appendChild(this.element);

    }
}



function onOpenMenuPlanning(){
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
function onRemoveActivityInPlanningEditor(dayKey,activityToRemove) {
    
    //Retire l'éléménet de l'array temporaire
    let indexToRemove = tempPlanningEditorDayItems.indexOf(activityToRemove);
    tempPlanningEditorDayItems.splice(indexToRemove,1);

    // Réactualise l'affichage
    onUpdatePlanningDayEditor(dayKey,tempPlanningEditorDayItems);


}



function onClickSaveFromPlanningDayEditor() {
    eventSavePlanningDayModification();
}


// sauvegarde des modifications d'une journée
function eventSavePlanningDayModification() {
    // Actualise le tableau
    userPlanningArray[currentPlanningDayKey] = [...tempPlanningEditorDayItems];

    // Actualise la base de donnée

    // quitte le menu
    onLeaveMenu("PlanningEditor");

    // actualise le planning hebdomadaire
    onSetPlanningItems();

    //popup Notification


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

