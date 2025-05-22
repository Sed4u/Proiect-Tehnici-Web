const express= require("express");
const path= require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");



const Client=pg.Client;
client=new Client({
    database:"tehniciweb",
    user:"dragos",
    password:"123456",
    host:"localhost",
    port:5432
})
client.connect()
client.query("select * from produse", function(err, rezultat ){
    console.log(err)    
    console.log("Rezultat query:", rezultat)
})
client.query("select * from unnest(enum_range(null::tip_produs))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})
client.query("SELECT * FROM unnest(enum_range(NULL::subcategorie_bautura))", function(err, rezultat) {
    console.log(err)
    console.log(rezultat)
});



app= express();

v=[10,27,23,44,15]

nrImpar=v.find(function(elem){return elem % 100 == 1})
console.log(nrImpar)

console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
    optiuniMeniu:null,
    optiuniSubcategorie:null
}

client.query("select * from unnest(enum_range(null::tip_produs))", function(err, rezultat ){
    console.log(err)    
    console.log("Tipuri produse:", rezultat)
    obGlobal.optiuniMeniu = rezultat.rows

})

client.query("SELECT * FROM unnest(enum_range(NULL::subcategorie_bautura))", function(err, rezultat) {
    console.log(err)
    console.log("Subcategorii bauturi:", rezultat.rows)
    obGlobal.optiuniSubcategorie = rezultat.rows
});



vect_foldere=["temp", "backup", "temp1"]
for (let folder of vect_foldere ){
    let caleFolder=path.join(__dirname,folder)
    if (! fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}


function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/ceva.txt" -> "ceva.txt"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    // console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");

//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})





function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut)
    obGlobal.obErori=JSON.parse(continut)
    console.log(obGlobal.obErori)
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}

initErori()


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.cale_fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp" )
        imag.cale_fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_fisier )
        
    }
    console.log(obGlobal.obImagini)
}
initImagini();






function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}


function getProdusById(id) {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM produse WHERE id=$1", [id], (err, rez) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rez.rows[0]);
      }
    });
  });
}



app.get('/compara/:id1/:id2', async (req, res) => {
  const { id1, id2 } = req.params;

  const produs1 = await getProdusById(id1);
  const produs2 = await getProdusById(id2);

  if (!produs1 || !produs2) {
    console.log('Produse nu au fost gasite');
  }

  res.render('pagini/compara', { produse: [produs1, produs2], optiuniMeniu: obGlobal.optiuniMeniu });
});


app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu
    res.locals.optiuniSubcategorie = obGlobal.optiuniSubcategorie
    next();
} )


app.use("/resurse", express.static(path.join(__dirname,"resurse")))
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))


app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index",{ip:req.ip, imagini:obGlobal.obImagini.imagini});
})

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// })

app.get("/index/a", function(req, res){
    res.render("pagini/index");
})


app.get("/cerere", function(req, res){
    res.send("<p style='color:blue'>Buna ziua</p>")
})


app.get("/fisier", function(req, res, next){
    res.sendfile(path.join(__dirname,"package.json"));
})


app.get("/abc", function(req, res, next){
    res.write("Data curenta: ")
    next()
})

app.get("/abc", function(req, res, next){
    res.write((new Date())+"")
    res.end()
    next()
})


app.get("/abc", function(req, res, next){
    console.log("------------")
})


app.get("/produse", function(req, res) {
    console.log(req.query);
    let conditieQuery = "";
    if (req.query.tip) {
        conditieQuery = ` WHERE tip = $1`;
    }

    const queryOptiuni = "SELECT * FROM unnest(enum_range(null::tip_produs))";
    const queryMinime = "SELECT tip, MIN(pret) as min_pret FROM produse GROUP BY tip";

    client.query(queryOptiuni, function(errOpt, rezOptiuni) {
        if (errOpt) {
            console.log(errOpt);
            afisareEroare(res, 2);
        } else {
            client.query(queryMinime, function(errMin, rezMinime) {
                if (errMin) {
                    console.log(errMin);
                    afisareEroare(res, 2);
                } else {
                    const minPretPeCategorie = {};
                    rezMinime.rows.forEach(row => {
                        minPretPeCategorie[row.tip] = parseFloat(row.min_pret);
                    });

                    const queryProduse = "SELECT * FROM produse" + conditieQuery;
                    const params = req.query.tip ? [req.query.tip] : [];

                    client.query(queryProduse, params, function(errProd, rezProd) {
                        if (errProd) {
                            console.log(errProd);
                            afisareEroare(res, 2);
                        } else {
                            const produse = rezProd.rows;
                            res.render("pagini/produse", {
                                produse: produse,
                                optiuni: rezOptiuni.rows,
                                minPretPeCategorie: minPretPeCategorie
                            });
                        }
                    });
                }
            });
        }
    });
});



app.get("/produs/:id", function(req, res){
    const idProdus = req.params.id;

    const queryProdus = `SELECT * FROM produse WHERE id=$1`;
    const querySeturi = `
        SELECT s.id, s.nume_set, s.descriere_set, s.imagine,
               p2.id AS produs_id, p2.nume AS produs_nume, p2.pret AS produs_pret
        FROM asociere_set a1
        INNER JOIN seturi s ON a1.id_set = s.id
        LEFT JOIN asociere_set a2 ON s.id = a2.id_set
        LEFT JOIN produse p2 ON a2.id_produs = p2.id
        WHERE a1.id_produs = $1
        ORDER BY s.id
    `;

    const querySimilare = `
    SELECT id, nume, imagine, pret, tip
    FROM produse
    WHERE tip = $1 AND id != $2
    LIMIT 4
    `;

    client.query(queryProdus, [idProdus], function(err1, rezProd){
        if (err1 || rezProd.rowCount == 0){
            console.log(err1);
            afisareEroare(res, 404);
        }   
        else {
            const produs = rezProd.rows[0];

            client.query(querySimilare, [produs.tip, idProdus], function(err3, rezSimilare){
                if (err3){
                    console.log(err3);
                    afisareEroare(res, 3);
                    return;
                }

                const produseSimilare = rezSimilare.rows;

                client.query(querySeturi, [idProdus], function(err2, rezSeturi){
                    if (err2){
                        console.log(err2);
                        afisareEroare(res, 2);
                    }
                    else {
                        const seturi = [];
                        let curSet = null;
                        let lastSetId = null;

                        for (let row of rezSeturi.rows) {
                            if (row.id !== lastSetId) {
                                if (curSet) {
                                    const n = curSet.produse.length;
                                    const reducere = Math.min(5, n) * 0.05;
                                    curSet.pret = (curSet.totalPret * (1 - reducere)).toFixed(2);
                                    delete curSet.totalPret;
                                    seturi.push(curSet);
                                }

                                curSet = {
                                    id: row.id,
                                    nume_set: row.nume_set,
                                    descriere_set: row.descriere_set,
                                    imagine: row.imagine,
                                    produse: [],
                                    totalPret: 0
                                };
                                lastSetId = row.id;
                            }

                            if (row.produs_id) {
                                const pret = parseFloat(row.produs_pret) || 0;
                                curSet.produse.push({
                                    id: row.produs_id,
                                    nume: row.produs_nume,
                                    pret: pret
                                });
                                curSet.totalPret += pret;
                            }
                        }

                        if (curSet) {
                            const n = curSet.produse.length;
                            const reducere = Math.min(5, n) * 0.05;
                            curSet.pret = (curSet.totalPret * (1 - reducere)).toFixed(2);
                            delete curSet.totalPret;
                            seturi.push(curSet);
                        }

                        res.render("pagini/produs", {
                            prod: produs,
                            seturi: seturi,
                            similare: produseSimilare
                        });
                    }
                });
            });
        }
    });
});


app.get("/seturi", function(req, res) {
  const query = `
    SELECT 
      s.id AS set_id, s.nume_set, s.descriere_set, s.imagine,
      p.id AS produs_id, p.nume AS produs_nume,
      p.pret AS produs_pret
    FROM seturi s
    LEFT JOIN asociere_set a ON s.id = a.id_set
    LEFT JOIN produse p ON a.id_produs = p.id
    ORDER BY s.id
  `;

  client.query(query, [], function(err, rez) {
    if (err) {
      console.error(err);
      afisareEroare(res, 2);
    } else {
      const seturi = [];
      let curSet = null;
      let lastSetId = null;

      rez.rows.forEach(row => {
        if (row.set_id !== lastSetId) {
          if (curSet) {
            const n = curSet.produse.length;
            const reducere = Math.min(5, n) * 0.05;
            curSet.pret = (curSet.totalPret * (1 - reducere)).toFixed(2);
            delete curSet.totalPret;
            seturi.push(curSet);
          }

          curSet = {
            id: row.set_id,
            nume_set: row.nume_set,
            descriere_set: row.descriere_set,
            imagine: row.imagine,
            produse: [],
            totalPret: 0
          };
          lastSetId = row.set_id;
        }

        if (row.produs_id) {
          const pret = parseFloat(row.produs_pret) || 0;
          curSet.produse.push({
            id: row.produs_id,
            nume: row.produs_nume,
            pret: pret
          });
          curSet.totalPret += pret;
        }
      });

      if (curSet) {
        const n = curSet.produse.length;
        const reducere = Math.min(5, n) * 0.05;
        curSet.pret = (curSet.totalPret * (1 - reducere)).toFixed(2);
        delete curSet.totalPret;
        seturi.push(curSet);
      }

      res.render("pagini/seturi", { seturi: seturi });
    }
  });
});


app.get("/set/:id", function(req, res) {
  const idSet = req.params.id;

  const query = `
    SELECT 
      s.id, s.nume_set, s.descriere_set, s.imagine,
      p.id AS produs_id, p.nume AS produs_nume, p.pret AS produs_pret, p.calorii AS produs_calorii
    FROM seturi s
    LEFT JOIN asociere_set a ON s.id = a.id_set
    LEFT JOIN produse p ON a.id_produs = p.id
    WHERE s.id = $1
  `;

  client.query(query, [idSet], function(err, rez) {
    if (err) {
      console.error(err);
      afisareEroare(res, 2);
    } else {
      if (rez.rowCount === 0) {
        afisareEroare(res, 404);
      } else {
        const set = {
          id: rez.rows[0].id,
          nume_set: rez.rows[0].nume_set,
          descriere_set: rez.rows[0].descriere_set,
          imagine: rez.rows[0].imagine,
          produse: []
        };

        let totalPret = 0;

        rez.rows.forEach(row => {
        if (row.produs_id) {
            const pretProdus = parseFloat(row.produs_pret) || 0;
            const caloriiProdus = parseFloat(row.produs_calorii) || 0;

            const produs = {
            id: row.produs_id,
            nume: row.produs_nume,
            pret: pretProdus,
            calorii: caloriiProdus
            };

            totalPret += pretProdus;
            set.produse.push(produs);
        }
        });


        const n = set.produse.length;
        const reducere = Math.min(5, n) * 0.05;
        set.pret = (totalPret * (1 - reducere)).toFixed(2);

        res.render("pagini/set", { set: set });
      }
    }
  });
});




app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res,403);
})


app.get("/*.ejs", function(req, res, next){
    afisareEroare(res,400);
})


app.get("/*", function(req, res, next){
    try{
        res.render("pagini"+req.url,function (err, rezultatRandare){
            if (err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                console.log(rezultatRandare);
                res.send(rezultatRandare)
            }
        });
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
        }
        else{
            afisareEroare(res);
        }
    }
})



app.listen(8080);
console.log("Serverul a pornit")


