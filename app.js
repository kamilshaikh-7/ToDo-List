
const express = require("express");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-kamil:test123@cluster0.xzeamyc.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {   //Schema
  name: String
};  

const Item = mongoose.model("Item", itemsSchema);   //Model

const item1 = new Item({
  name: "Welcome to your todo-list." 
});
const item2 = new Item({
  name: "Hit the + button to add new items." 
});
const item3 = new Item({
  name: "<-- Hit this to delete an item." 
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
          console.log("Added default items to Database successfully..");
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    
  });


});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;
  _.capitalize(customListName); //Capitalize using lodash
  
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+ customListName);

      } else {
        //Show an existing list
        res.render('list', {listTitle: customListName, newListItems: foundList.items});
      }
    }
  })

  
});

// app.get("/favicon.ico", function(req, res){
//   res.sendStatus(204);
// });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const itemAdded = new Item({
    name: itemName
  });

  if (listTitle === "Today") {
    itemAdded.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }, function (err, foundList) {
      if (!err) {
        foundList.items.push(itemAdded);
        foundList.save();
        res.redirect("/"+ listTitle);
      }
    })
    
  }



  
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Succesfully deleted checked items!");
        res.redirect("/");
      }
    });  
  } else {
    List.findOneAndUpdate({ name: listTitle }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listTitle);
      }
    });
  }

  
});



// app.get("/about", function(req, res){
//   res.render("about");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
