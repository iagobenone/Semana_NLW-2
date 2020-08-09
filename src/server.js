
//servidor
const express = require('express')
const server = express()

const { 
    pageGiveClasses,
    pageLanding,
    pageStudy,
    saveClasses
} = require('./pages')

//configurar nunjucks
const nunjucks = require("nunjucks")
nunjucks.configure('src/views',{
    express: server,
    noCache: true
}) 


server
//configurar arquivos estaticos
.use(express.urlencoded({extended: true})
.use(express.static("public")) // Usando todos os arquivos estaticos como as imagens
.get("/",(pageLanding)) //links
.get("/study", (pageStudy))
.get("/give-classes", (pageGiveClasses))
.post("/save-class", saveClasses)

.listen(5500))