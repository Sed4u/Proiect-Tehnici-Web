let produseInitiale = [];

document.addEventListener('DOMContentLoaded', function() {
    const descriereTextarea = document.getElementById('inp-descriere');
    
    function validateTextarea() {
        const value = descriereTextarea.value.trim();
        if (value.length > 0 && /\d/.test(value)) {
            descriereTextarea.classList.add('is-invalid');
        } else {
            descriereTextarea.classList.remove('is-invalid');
        }
    }
    
    descriereTextarea.addEventListener('input', validateTextarea);
    
    validateTextarea();
});

window.onload= function(){
    produseInitiale = Array.from(document.getElementsByClassName("produs")); //tine minte ordinea produselor inainte de resetare
    btn=document.getElementById("filtrare");
    btn.onclick=function(){
        if (!validareInputuri()) return;
        let inpNume= document.getElementById("inp-nume").value.trim().toLowerCase()
        
        let vectRadio=document.getElementsByName("gr_rad")

        let inpCalorii=null
        let minCalorii=null
        let maxCalorii=null
        for (let rad of vectRadio){
            if (rad.checked){
                inpCalorii=rad.value
                if (inpCalorii!="toate"){
                    [minCalorii,maxCalorii]=inpCalorii.split(":") //"350:700" -> ["350","700"]
                    minCalorii=parseInt(minCalorii) //"350" -> 350
                    maxCalorii=parseInt(maxCalorii)
                }
                break
            }
        }
        
        let inpAmbalaj = document.getElementById("inp-ambalaj").value.trim().toLowerCase();

        let vCheckboxSubcat = document.querySelectorAll("input[name='subcategorie']:checked");
        let vValoriSubcat = Array.from(vCheckboxSubcat).map(cb => cb.value.trim().toLowerCase());


        let inpDescriere = document.getElementById("inp-descriere").value.trim().toLowerCase();

        let optiuniIngrediente = Array.from(document.getElementById("inp-multi-ingrediente").selectedOptions).map(opt => opt.value.trim().toLowerCase());


        let inpPret= document.getElementById("inp-pret").value

        let inpCategorie= document.getElementById("inp-categorie").value.trim().toLowerCase()

        let produse= document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="none";
            let nume=prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1= nume.startsWith(inpNume)


            let calorii=parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML.trim())

            let cond2= (inpCalorii=="toate" || (minCalorii<=calorii && calorii<maxCalorii) )

            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3 = (inpPret <= pret)

            let categorie=prod.getElementsByClassName("val-tip")[0].innerHTML.trim().toLowerCase()
            let cond4 =  (inpCategorie=="toate" || inpCategorie==categorie)

            let ambalaj = prod.getElementsByClassName("val-ambalaj")[0].innerHTML.trim().toLowerCase();
            let cond5 = (inpAmbalaj == "" || inpAmbalaj == ambalaj);

            let subcatElem = prod.getElementsByClassName("val-subcategorie")[0];
            let cond6;
            if (!subcatElem) {
                cond6 = true;
            } else {
                let subcat = subcatElem.innerHTML.trim().toLowerCase();
                cond6 = (vValoriSubcat.length > 0 && vValoriSubcat.includes(subcat));
            }

            let descriere = prod.getElementsByClassName("descriere")[0].innerHTML.trim().toLowerCase();
            let cond7 = (inpDescriere == "" || descriere.includes(inpDescriere));

            let ingrediente = prod.getElementsByClassName("ingrediente")[0].innerHTML.trim().toLowerCase().split(/,\s*/);
            let cond8 = (optiuniIngrediente.length == 0 || !ingrediente.some(ing => optiuniIngrediente.includes(ing)));


            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                prod.style.display="block";
            }
        }

    }

    document.getElementById("inp-pret").onmousemove=function(){
        document.getElementById("infoRange").innerHTML=`(${this.value})`
    }

    document.getElementById("resetare").onclick = function () {
        if (!confirm("Sigur doriti sa resetati filtrele si sortarea?")) {
            return;
        }
        document.getElementById("inp-ambalaj").value = "";
        document.getElementById("inp-descriere").value = "";

        let listaSubcat = document.querySelectorAll("input[name='subcategorie']");
        for (let cb of listaSubcat)
            cb.checked = true;


        let listaIngrediente = document.getElementById("inp-multi-ingrediente").options;
        for (let opt of listaIngrediente)
            opt.selected = false;

        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoRange").innerHTML = "(0)";

        document.getElementById("inp-nume").value=""

        let produse= document.getElementsByClassName("produs")

        document.getElementById("i_rad4").checked=true;

        for (let prod of produse){
            prod.style.display="block";
        }
    }

    document.getElementById("sortCrescSubcat").onclick = function() {
        if (!validareInputuri()) return;
        sorteazaSubcat(1);
    }
    document.getElementById("sortDescrescSubcat").onclick = function() {
        if (!validareInputuri()) return;
        sorteazaSubcat(-1);
    }


    function sorteazaSubcat(semn){
    let produse= document.getElementsByClassName("produs");
    let vProduse= Array.from(produse);
    vProduse.sort(function(a, b) {
        let subcatA = a.getElementsByClassName("val-subcategorie")[0]?.innerHTML.trim().toLowerCase() || "";
        let subcatB = b.getElementsByClassName("val-subcategorie")[0]?.innerHTML.trim().toLowerCase() || "";

        if (subcatA !== subcatB) {
            return semn * subcatA.localeCompare(subcatB);
        }

        let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
        let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());
        return semn * (pretA - pretB);
    });

    for (let prod of vProduse) {
        prod.parentNode.appendChild(prod); // Reatașează în ordinea sortată
    }
}


     document.getElementById("btn-suma").addEventListener("click", function () {
    let produse = document.getElementsByClassName("produs");
    let sumaPreturi = 0;

    for (let prod of produse) {
        if (prod.style.display !== "none") {
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            sumaPreturi += pret;
        }
    }

    if (!document.getElementById("suma_preturi")) {
        let divRezultat = document.createElement("div");
        divRezultat.innerText = `Suma: ${sumaPreturi.toFixed(2)} lei`;
        divRezultat.id = "suma_preturi";

        divRezultat.style.position = "fixed";
        divRezultat.style.bottom = "20px";
        divRezultat.style.right = "20px";
        divRezultat.style.background = "#198754";
        divRezultat.style.color = "white";
        divRezultat.style.padding = "10px 20px";
        divRezultat.style.borderRadius = "10px";
        divRezultat.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        divRezultat.style.zIndex = "9999";

        document.body.appendChild(divRezultat);

        setTimeout(function () {
            let div = document.getElementById("suma_preturi");
            if (div) {
                div.remove();
            }
        }, 2000);
    }
});


    function validareInputuri() {
        let isValid = true;
        let mesajEroare = "";

        // Validare input nume
        let inpNumeElem = document.getElementById("inp-nume");
        let inpNume = inpNumeElem.value.trim();
        if (inpNume.length > 0 && /\d/.test(inpNume)) {
            isValid = false;
            mesajEroare += "Numele nu trebuie să conțină cifre.\n";
            inpNumeElem.style.border = "2px solid red";
        } else {
            inpNumeElem.style.border = "";
        }

        // Validare textarea descriere
        let textareaDescriere = document.getElementById("inp-descriere");
        let inpDescriere = textareaDescriere.value.trim();
        if (inpDescriere.length > 0 && /\d/.test(inpDescriere)) {
            isValid = false;
            mesajEroare += "Descrierea nu trebuie să conțină cifre.\n";
            textareaDescriere.style.border = "2px solid red";
        } else {
            textareaDescriere.style.border = "";
        }

        // Validare radio (calorii)
        let vectRadio = document.getElementsByName("gr_rad");
        let vreunRadioBifat = Array.from(vectRadio).some(r => r.checked);
        if (!vreunRadioBifat) {
            isValid = false;
            mesajEroare += "Selectați o opțiune pentru calorii.\n";
            vectRadio.forEach(r => r.parentNode.style.border = "2px solid red");
        } else {
            vectRadio.forEach(r => r.parentNode.style.border = "");
        }

        // Validare checkboxuri subcategorie
        let vCheckboxSubcat = document.querySelectorAll("input[name='subcategorie']:checked");
        let containerSubcat = document.getElementById("gr-subcat");
        if (vCheckboxSubcat.length === 0) {
            isValid = false;
            mesajEroare += "Bifați cel puțin o subcategorie.\n";
            if (containerSubcat)
                containerSubcat.style.border = "2px solid red";
        } else {
            if (containerSubcat)
                containerSubcat.style.border = "";
        }

        // Afișare erori dacă există
        if (!isValid) {
            alert(mesajEroare);
        }

        return isValid;
    }

}

//console.log(btn.id)