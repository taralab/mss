
// Gestion condition utilisation
 const conditionText = `
  <p>
                <b>ℹ️ Ce prototype est gratuit </b>et mis à ta disposition pour
                 suivre tes activités physiques. 
                 <b>Toutes tes données sont stockées dans ton navigateur</b> et rien n’est collecté ou envoyé 
                 sur un serveur.
            </p>
            <p>
                ⚠️ <b>ATTENTION : </b>
                <ul>
                    <li>
                        <b>Si tu effaces tes cookies </b>ou utilises un outil de nettoyage, <b>tes données seront supprimées</b>. 
                        N'oublie pas d'<b>effectuer des sauvegardes</b> (menu "Paramètres") de temps en temps pour éviter toute perte.
                    </li>
                    <li>
                        <b>Ne stocke pas d'informations sensibles</b> (mots de passe, informations bancaires ou personnelles, etc...) dans l'application.
                    </li>
                </ul>
            </p>
    
            <p>
                📌 Pour une expérience optimale, <b>installe-le via "Google Chrome"</b>.
            </p>
`;


// Insertion du texte dans les conditions et dans A propos







function onOpenMenuInfo(){
    // Insert les conditions dynamique
    document.getElementById("divConditionDynamicTextInfo").innerHTML = conditionText;
}
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   // Retour depuis Info
   function onClickReturnFromInfo() {
    // Vide les conditions
    document.getElementById("divConditionDynamicTextInfo").innerHTML = "";
   
       // ferme le menu
       onLeaveMenu("Info");
   };