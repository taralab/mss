
// Référencement des icones de tries

let btnSortDistanceRef = document.getElementById("btnSortDistance"),
    btnSortDuration = document.getElementById("btnSortDuration"),
    btnSortDate = document.getElementById("btnSortDate");


// Remet les tries et filtres par défaut
function onResetSortAndFilter(){
    if (devMode === true){console.log("[SORT FILTER] Réinitialiser les filtres et trie par défaut");};

    currentFilter = defaultFilter;
    currentSortType = "dateRecente";

};


// Set les icones de trie selon le trie en cours
function onSetIconSort() {

    if (devMode === true){console.log("[SORT FILTER] modifie de style des icones de filtre");};
    
    //reset les texte de filtre
    btnSortDistanceRef.innerHTML = "Distance";
    btnSortDuration.innerHTML = "Chrono";
    btnSortDate.innerHTML = "Date";




    // Bouton de tri par distance
    if (currentSortType === "distanceCroissante" || currentSortType === "distanceDecroissante") {
        btnSortDistanceRef.classList.add("btn-sort-Selected");
        btnSortDistanceRef.classList.remove("btn-sort");
        btnSortDistanceRef.innerHTML = currentSortType === "distanceCroissante" ? "Distance ▼" : "Distance ▲";
    } else {
        btnSortDistanceRef.classList.add("btn-sort");
        btnSortDistanceRef.classList.remove("btn-sort-Selected");
    }

    // Bouton de tri par durée
    if (currentSortType === "chronoCroissant" || currentSortType === "chronoDecroissant") {
        btnSortDuration.classList.add("btn-sort-Selected");
        btnSortDuration.classList.remove("btn-sort");
        btnSortDuration.innerHTML = currentSortType === "chronoCroissant" ? "Chrono ▼" : "Chrono ▲";
    } else {
        btnSortDuration.classList.add("btn-sort");
        btnSortDuration.classList.remove("btn-sort-Selected");
    }

    // Bouton de tri par date
    if (currentSortType === "dateRecente" || currentSortType === "dateAncienne") {
        btnSortDate.classList.add("btn-sort-Selected");
        btnSortDate.classList.remove("btn-sort");
        btnSortDate.innerHTML = currentSortType === "dateRecente" ? "Date ▲" : "Date ▼";

    } else {
        btnSortDate.classList.add("btn-sort");
        btnSortDate.classList.remove("btn-sort-Selected");
    }



};


//---------------------------------------- LES FILTRES ----------------------------





//  variable et referencement
let defaultFilter = "ALL",
    currentFilter = defaultFilter, // le type de filtre en cours
    selectorRef = document.getElementById("selectorCategoryFilter");



// Génération du filtre sur les catégorie d'activité
function onGenerateDynamiqueFilter(allData) {
    isActivityPlannedExist = false;
    let dynamicFilterList = [];
    let allFilterForControl = [];//uniquement pour comparer des filtres

    // Recupère les nouvelle catégorie présente dans la liste en cours
    allData.forEach(data=>{
        if (!dynamicFilterList.includes(data.name))  {
            dynamicFilterList.push(data.name);
        };

        // recherche la présence d'au moins une activité planifiée et stop recherche lorsque trouvé
        if (isActivityPlannedExist === false && data.isPlanned === true) {
            isActivityPlannedExist = true;
        }
    });

    if (devMode === true){console.log("[SORT FILTER] Activité plannifié existante = " + isActivityPlannedExist);};


    // regarde si le filtre en cours existe encore, s'il n'existe plus, reset filtre et trie
    allFilterForControl = [...dynamicFilterList];
    if(isActivityPlannedExist){
        allFilterForControl.push("PLANNED");
    };

    if (!allFilterForControl.includes(currentFilter) && currentFilter != defaultFilter ) {
        if (devMode === true){console.log(`[SORT FILTER] Filtre en cours : ${currentFilter} non présent. réinitialisation`);};
        onResetSortAndFilter();
    }


    dynamicFilterList.sort();

    if (devMode === true){
        console.log("[SORT FILTER] valeur de dynamicFilterList = " );
        console.log(dynamicFilterList);
    };

    // Crée les options dans le selection pour les catégorie
    onGenerateActivityOptionFilter(dynamicFilterList);
};



// Génération des options d'activité pour le filtre avec tri
function onGenerateActivityOptionFilter(allActivityData) {

    selectorRef.innerHTML = "";


    // Ajouter l'option "Tous" au début
    let allOption = document.createElement("option");
    allOption.value = "ALL";
    allOption.innerHTML = "Tous";
    selectorRef.appendChild(allOption);

    // Ajouter l'option "Planifiées" juste après si existe
    if (isActivityPlannedExist) {
        let plannedOption = document.createElement("option");
        plannedOption.value = "PLANNED";
        plannedOption.innerHTML = "Planifiées";
        selectorRef.appendChild(plannedOption);
    }

    // Ajouter les autres options des activités existantes triées
    allActivityData.forEach(activity => {
        let newOption = document.createElement("option");
        newOption.value = activity;
        newOption.innerHTML = activityChoiceArray[activity].displayName;
        selectorRef.appendChild(newOption);
    });

    // Je set la valeur de l'option selon le filtre en cours
    selectorRef.value = currentFilter;


    // Génère les fakes options
    onGenerateFakeActivityOptionFilter(allActivityData);
};




function onGenerateFakeActivityOptionFilter(allActivityData) {
    let parentTargetRef = document.getElementById("divFakeSelectOptFilterActivityList");

    // Traite d'abord les favoris
    if (devMode === true){
        console.log("[FAKE SELECTOR] Lancement de la generation des choix des activités dans le filtre");
        console.log("[FAKE SELECTOR] ID Parent pour insertion : " + parentTargetRef);
    };

    parentTargetRef.innerHTML = "";


    // Le bouton radio sera set par rapport au current filter


    // Ajouter l'option "Tous" au début
    let newContainer = document.createElement("div");
    newContainer.classList.add("fake-opt-item-container");
    newContainer.onclick = function (event){
        event.stopPropagation();
        onChangeSelectorFilter("ALL","btnRadio-filter-all");
    }
    // Ajout la ligne bleu si ne créer pas l'option "PLANNED"
    if (!isActivityPlannedExist) {
        newContainer.classList.add("fake-opt-item-last-favourite");
    }

    let newImg = document.createElement("img");
    newImg.classList.add("fake-opt-item");
    newImg.src = "./images/icon-All.webp";

    let newTitle = document.createElement("span");
    newTitle.innerHTML = "Tous";
    newTitle.classList.add("fake-opt-item");

    // Bouton radio fake pour simuler le selecteur
    let newBtnRadioFake = document.createElement("div");
    newBtnRadioFake.classList.add("radio-button-fake");

    if (currentFilter === "ALL") {
        newBtnRadioFake.classList.add("selected");
    }

    newBtnRadioFake.id = "btnRadio-filter-all";




    // Insertion
    newContainer.appendChild(newImg);
    newContainer.appendChild(newTitle);
    newContainer.appendChild(newBtnRadioFake);

    parentTargetRef.appendChild(newContainer);


    // Ajouter l'option "Planifiées" juste après si existe
    if (isActivityPlannedExist) {
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container","fake-opt-item-last-favourite");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onChangeSelectorFilter("PLANNED","btnRadio-filter-isPlanned");
        }

        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = "./images/icon-isPlanned.webp";

        let newTitle = document.createElement("span");
        newTitle.innerHTML = "Planifiées";
        newTitle.classList.add("fake-opt-item");

        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-filter-isPlanned";
        if (currentFilter === "PLANNED") {
            newBtnRadioFake.classList.add("selected");
        }

        // Insertion
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);

        parentTargetRef.appendChild(newContainer);
    }


    // Ajout de reste des activités
    allActivityData.forEach((e,index)=>{

         // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onChangeSelectorFilter(e,"btnRadio-filter-"+e);
        }


        // Style sans border botton pour le dernier
        if (index === (allActivityData.length - 1)) {
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
        newBtnRadioFake.id = "btnRadio-filter-" + e;
        if (currentFilter === e) {
            newBtnRadioFake.classList.add("selected");
        }


        // Insertion
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);

        parentTargetRef.appendChild(newContainer);
    })






}




// Clique sur le fake selecteur
function onClickFakeSelectFilter(){
    // Affiche le fake option
    document.getElementById("divFakeSelectOptFilterActivity").style.display = "flex";

}


function onCloseFakeSelectFilter(event){
    document.getElementById("divFakeSelectOptFilterActivity").style.display = "none";
}












// Fonction de filtre de l'affichage des activité

function onFilterActivity(sortType,filterType,activityArray) {


    if (devMode === true){
        console.log("[SORT FILTER] fonction de filtre sur activité");
        console.log("[SORT FILTER] type de trie = " + sortType + " type de filtre = " + filterType);
    };

    let allDataFiltered = [];


    // si le filtre est réglé sur "tous" affiche tous
    if (filterType === defaultFilter) {
        // Insertion de tous les activités dans la liste


        if (devMode === true){console.log(" [SORT FILTER] Demande de trie sur toutes les données");};
        onSortActivity(sortType,activityArray);

    } else if (filterType === "PLANNED"){
        if (devMode === true){console.log(" [SORT FILTER] Demande de filtre sur les activités planifiées");};

        allDataFiltered = allUserActivityArray.filter(item =>{
            return item.isPlanned === true;
        });
        onSortActivity(sortType,allDataFiltered);

    } else {

        allDataFiltered = allUserActivityArray.filter(item =>{
            return item.name === filterType;
        });
        if (devMode === true){console.log("[SORT FILTER] Demande de trie sur les données filtré");};
        // Lance le trie uniquement sur les éléments filtré
        onSortActivity(sortType,allDataFiltered);

    };


};




// Changement du filtre via action de l'utilisateur
function onChangeSelectorFilter(value,idBtnRadioTarget){


    if (devMode === true){console.log(" [SORT FILTER] changement de selecteur du filtre pour = " + selectorRef.value);};
    currentFilter = value;

    // Set également le vrai selecteur
    selectorRef.value = value;

    // Retire les boutons radio plein à tous les boutons
    onResetFakeSelecFilterRadio();

    // le met à l'option en cours
    document.getElementById(idBtnRadioTarget).classList.add("selected");

    onCloseFakeSelectFilter();
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);

};


function onResetFakeSelecFilterRadio() {
       // Pour rechercher dans les enfants d'un parent spécifique
       let parent = document.getElementById("divFakeSelectOptFilterActivityList");


       // Retire les boutons radio plein
       let elementToRemoveClass = parent.querySelectorAll(".selected");
       elementToRemoveClass.forEach(e=>{
           e.classList.remove("selected");
       });

}





// --------------------------------------- les TRIES  ----------------------------------------






let currentSortType = "dateRecente";

// Fonction de selecteur de trie personnalisé (appelé depuis l'utilisateur)
function onUserChangeSortType(sortCategory) {
    if (devMode === true){console.log("[SORT FILTER] type de trie précédent : "+ currentSortType);};


    switch (sortCategory) {


        case "date":
            if (currentSortType === "dateRecente") {
                currentSortType = "dateAncienne";
            }else{
                currentSortType = "dateRecente";
            };
        break;
        case "duration":
            if (currentSortType === "chronoCroissant") {
                currentSortType = "chronoDecroissant";
            }else{
                currentSortType = "chronoCroissant";
            };
        break;
        case "distance":
            if (currentSortType === "distanceCroissante"){
                currentSortType = "distanceDecroissante";
            }else{
                currentSortType = "distanceCroissante";               
            };
        break;
    
        default:
            console.log(" [SORT FILTER] erreur lors du changement de categorie de trie");
        break;
    };


    if (devMode === true){console.log(`[SORT FILTER] Changement du type de trie sur ${sortCategory}  pour ${currentSortType}`);};




    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);


};






// Fonction du trie
function onSortActivity(sortType,filteredData) {

    if (devMode === true){console.log("[SORT FILTER] Demande de trie par : " + sortType );};

    if (sortType === "dateRecente") {
        filteredData.sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) {
                return dateDiff; // Tri par date décroissante
            }
            return b._id.localeCompare(a._id); // Tri alphabétique descendant si les dates sont identiques
        });
    } else if (sortType === "dateAncienne") {
        filteredData.sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) {
                return dateDiff; // Tri par date croissante
            }
            return a._id.localeCompare(b._id); // Tri alphabétique descendant si les dates sont identiques
        });
    }else if (sortType === "distanceCroissante") {
        filteredData.sort((a, b) => a.distance - b.distance); // Tri par distance croissante
    }else if (sortType === "distanceDecroissante") {
        filteredData.sort((a, b) => b.distance - a.distance); // Tri par distance décroissante
    }else if (sortType === "chronoCroissant") {
        filteredData.sort((a, b) => onConvertTimeToSecond(a.duration) - onConvertTimeToSecond(b.duration)); // Tri par distance croissante
    }else if (sortType === "chronoDecroissant") {
        filteredData.sort((a, b) => onConvertTimeToSecond(b.duration) - onConvertTimeToSecond(a.duration)); // Tri par distance décroissante
    };


    // Mettre à jour le style également

    if (devMode === true){console.log(" [SORT FILTER] appel la fonction de trie");};
    onSetIconSort();



    // Insert uniquement les activités du filtre
    onInsertActivityInList(filteredData);
};




