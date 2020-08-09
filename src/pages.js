const Database = require('./database/db')

const{ 
    subjects,
    weekdays,
    getSubject,
    convertHoursToMinuts,
} = require('./utils/format')

function pageLanding(req, res) {
    return res.render("index.html")
}
async  function pageStudy(req, res){
    const filters = req.query

    if(!filters.subject || filters.weekday || filters.time){
        return res.render("study.html", {filters, subjects, weekdays})
    }
    //converter horas em minutos
    const timeToMinutes = convertHoursToMinuts(filters.time)

    const query = `
        SELECT classes.*, proffys.*
        FROM proffys
        JOIN classes ON (classes.proffy_id = proffys.id)
        WHERE EXISTS (
            SELECT class_schedule.*
            FROM class_schedule
            WHERE class_schedule.class_id = classes.id
            AND class_schedule.weekday = ${filters.weekday}
            AND class_schedule.time_from <= ${timeToMinutes}
            AND class_schedule.time_to > ${timeToMinutes}
        )
        AND classes.subject = '${filters.subject}'
    `

    //caso haja erro na hora da consulta do banco de dados.
    try {
        const db = await Database
        const proffys = await db.all(query)
        proffys.map((proffy)=>{
            proffy.subject = getSubject(proffy.subject)
        })
        return res.render('study.html', {proffys, subjects, filters, weekdays })
    } catch (error) {
        console.log(error)
    }
}

function saveClasses(req,res){
    const createProffy = require('./database/createProffy')

    const proffyValue = {
        name: req.body.name,
        avatar: req.body.avatar,
        whatsapp: req.body.whatsapp,
        bio: req.body.bio
    }
    const classValue ={
        subject: req.body.subject,
        cost: req.body.cost
    }
    const classSchaduleValues =  req.body.weekday.map((weekday, index) =>{

        return{
            weekday,
            time_from: convertHoursToMinuts(req.body.time_from[index]),
            time_to: req.body.time_to[index]
        }

    })

    try {
        const db = await Database
        await createProffy(db, { proffyValue, classValue, classScheduleValues})
        
        let queryString = "?subjects" + req.body.subject
        queryString += "&weekdays=" + req.body.weekday[0]
        queryString += "&time" + req.body.time_from[0]

        return res.redirect("/study" + queryString)
    } catch (error) {
        console.log(error)
    }
    
    

    
}


function pageGiveClasses(req, res){
    
    //se não mostrar a página
    return res.render("give-classes.html", {subjects, weekdays})
}
module.exports ={
    pageLanding,
    pageGiveClasses,
    pageStudy,
    saveClasses
}