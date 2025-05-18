
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
];





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








// QUITTE MENU

// Retour depuis Info
function onClickReturnFromPlanning() {

    // ferme le menu
    onLeaveMenu("Planning");
};

