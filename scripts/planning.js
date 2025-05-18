
// Initialisation des variables
let userPlanningArray = {
    "lundi" : ["MUSCULATION","ETIREMENT"],
    "mardi" : ["C-A-P"],
    "mercredi" : ["MUSCULATION"],
    "jeudi" : ["VELO","ETIREMENT"],
    "vendredi" : ["NATATION"],
    "samedi" : ["RENFORCEMENT"],
    "dimanche" : []
}





function onOpenMenuPlanning(){
    onSetPlanningItems();
};




// Remplit la grille du planning selon la variable
function onSetPlanningItems(){

    Object.keys(userPlanningArray).forEach(key =>{
        // Référence le parent et reset ses éléments
        let parentRef = document.getElementById(`divPlanningContent_${key}`);
        parentRef.innerHTML = "";

        if (userPlanningArray[key].length > 0) {
            // pour chaque activité du jour concernée
            userPlanningArray[key].forEach(activity => {
                // crée une image
                let newImg = document.createElement("img");
                newImg.src = activityChoiceArray[activity].imgRef;

                // et l'insère
                parentRef.appendChild(newImg);
            });
        }else{
            // si vide, met l'icone de repos
            let newImg = document.createElement("img");
            newImg.src = "./images/icon-repos.webp";
            parentRef.appendChild(newImg);
        }



    })


}








// QUITTE MENU

// Retour depuis Info
function onClickReturnFromPlanning() {

    // ferme le menu
    onLeaveMenu("Planning");
};

