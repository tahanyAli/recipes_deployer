'use strict';
const express = require('express');
const axios=require('axios');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser')
const { Client } = require('pg');
const req = require('express/lib/request');


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//VARIABLES
const PORT = process.env.PORT;
const apikey=process.env.API_KEY
const url =`postgres://sngtvwgz:76YWEHqzxD29mTRfOTagDDsCiy0HpLRN@chunee.db.elephantsql.com/sngtvwgz`; 

const client = new Client(url)
//routes
app.get('/', homeHandler)
app.get("/recipes", recipesHandler);
app.get('/searchRecipe', searchRecipeHandler);
app.post('/addRecipe',addRecipeHandler);
app.get('/getAllRecipes',getAllRecipesHandler);
app.put('/updateRecipe/:id',handleUpdate)//params
app.delete('/deleteRecipe/:id', handleDelete)
app.use("*", handleNtFoundError)// always make it the last route 

//functions
function homeHandler(req, res){
    res.send("Hello World")
}

function handleNtFoundError(req, res){
    res.status(404).send("not found")
}
function recipesHandler(req, res){
    //axios.get(url).then().catch()
    let url = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apikey}`;
    axios.get(url)
    .then((result)=>{
        console.log(result.data.recipes);

        let dataRecipes = result.data.recipes.map((recipe)=>{
            return new Recipe(recipe.title, recipe.readyInMinutes,recipe.image)
        })
        // res.json(result.data.recipes);
        res.json(dataRecipes);
    })
    .catch((err)=>{
        console.log(err);
    })

} 
function searchRecipeHandler(req,res){
    let recipeName = req.query.name // name it as you want 
    console.log(recipeName)
    let url=`https://api.spoonacular.com/recipes/complexSearch?query=${recipeName}&apiKey=${apikey}`
    axios.get(url)
    .then((result)=>{
        console.log(result.data.results);
        let response= result.data.results;
        res.json(response);
    })
    .catch((err)=>{
        console.log(err)
    })
    // res.send("request accepted ")
    
}  
//CRUD functions
function addRecipeHandler(req,res){
    console.log(req.body);
    // let title = req.body.title;
    // let time  = req.body.time;
    // let image = req.body.image;
    //or 
    let {title,time,image} = req.body; // destructuring 
    // client.query(sql,values)
    let sql = `INSERT INTO recipes (title, time, image)
    VALUES ($1,$2,$3) RETURNING *; `
    let values = [title,time,image]
    client.query(sql,values).then((result)=>{
        console.log(result.rows)
        // res.status(201).send("data successfully saved in db to server")
        res.status(201).json(result.rows)

    }

    ).catch((err)=>{
        errorHandler(err,req,res);
    })

}

function getAllRecipesHandler(req,res) {
    let sql =`SELECT * FROM recipes;`; //read all data from database table
    client.query(sql).then((result)=>{
        console.log(result);
        res.json(result.rows)
    }).catch((err)=>{
        errorHandler(err,req,res)
    })
}
function handleUpdate(req,res){
    // console.log(11111111,req.params);
    let id = req.params.id // params
    let {title,time,image} = req.body;
    console.log(222222222,id,title,time,image);
    let sql=`UPDATE recipes SET title = $1, time = $2, image=$3 
    WHERE id = $4 RETURNING *;`;
    let values = [title,time,image,id];
    client.query(sql,values).then(result=>{
        console.log(result.rows);
        res.send(result.rows)
    }).catch()

}

function handleDelete(req,res){
    let {id} = req.params; //destructuring
    //or
    //let recipeName = req.params.recipeName
    let sql=`DELETE FROM recipes WHERE id = $1;` ;
    let value = [id];
    client.query(sql,value).then(result=>{
        res.status(204).send("deleted");
    }).catch()


}



//constructor
function Recipe(title,time,image){
    this.title=title;
    this.time=time;
    this.image=image;
  

}

client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`listening on port${PORT}`);
    })

}).catch()

// export default app;