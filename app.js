
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');

const app = express();
// console.log(__dirname);

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

//Connecting to mongoose DataBase
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://Narsingh9:narsingh%401389@cluster0.1wltm.mongodb.net/todolistDB")

// Schema for the database
const itemsSchema = new mongoose.Schema({
  name : String
});

//creating a model
const Item = mongoose.model("Item", itemsSchema);

app.set("view engine" , "ejs");
//
// let items = ["Item 1" , "Item 2"];
const item1 = new Item({
  name : "Item1"
})
const item2 = new Item({
  name : "Item2"
})
const item3 = new Item({
  name : "Item3"
})
const defaultItems = [item1, item2, item3]
// let workItems = ["work1" , "work2"];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
  // res.send("Server is up and running.");
  Item.find((err,result) => {
    if (result.length === 0){
      Item.insertMany(defaultItems , (err) => {
        if (err){
          console.log(err);
        }else {
          console.log("success");
        }
      })
      res.redirect("/");
    }else {
      let day = date();
      res.render("list", {
        givenDay : day ,
         nextItems : result
       });
    }
  });
});

app.get("/:newList", (req,res) =>{
  const newList = _.capitalize(req.params.newList);


  List.findOne({name : newList},(err,result) => {
    if (!err){
      if(!result){
        const new1 = new List({
          name : newList,
          items : defaultItems
        })
        new1.save();
        res.redirect("/" + newList);
      }else{
        // console.log(result);
        res.render("list", {
          givenDay : result.name ,
           nextItems : result.items
         });
      }
}
})
});


app.post("/", function(req,res){
  console.log(req.body);

  const newItem = req.body.listItem;
  const itme233 = req.body.send;
  let day = date();
  console.log(day);
  const a = new Item({
    name : newItem
  })

  if (itme233.slice(0,7) === day.slice(0,7)){
    a.save();
    res.redirect("/")
  }else{
    List.findOne({name : itme233},(err,result) =>{
      result.items.push(a);
      result.save();
      res.redirect("/"+itme233);
    })
  }


});

app.post("/delete" , (req,res) =>{
  const id = req.body.checkbox;
  const {customList} = req.body;


  let day = date()
  if (customList.slice(0,7) === day.slice(0,7)){
    Item.findByIdAndRemove(id, (err) =>{
      if(!err) {
          console.log("Removed Item successfully");
          res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate(
      {name : customList},
      {$pull : {items : {_id : id}}},
    (err,result)=>{
      if (!err){
        res.redirect("/" + customList)
      }
    })
  }
})

app.listen(3000, function(){
  console.log("Server is running on port 3000.......");
});
