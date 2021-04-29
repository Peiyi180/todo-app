const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require('lodash');

const app = express();

mongoose.connect('mongodb+srv://p-j:Qqqqqq123..@cluster0.64h6c.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("item", itemsSchema);

const day1 = new Item ({
  name: "day1"
});

const day2 = new Item ({
  name: "day2"
});

const day3 = new Item ({
  name: "day3"
})

const defaultItems = [day1, day2, day3];
//
// Item.insertMany(defaultItems, function(err){
//   if(err) {
//     console.log(err);
//   } else {
//     console.log("Inserted Default Item successfully");
//   }
// });

const listSchema = {
  name: String,
  itemsList: [itemsSchema]
};

const List = mongoose.model('list', listSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'));

app.get("/", function(req, res) {
  Item.find(function(err, result){

    if (result.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Inserted Default Item successfully");
        }
      });
      res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", items: result});
    }
  });
});

app.get('/:page', function(req, res){
  const listName = _.capitalize(req.params.page);

  List.findOne({
    name: listName
  }, function(err, foundList){
    if(!err){
      if(!foundList) {
        //Create a new List
        const list = new List({
          name: listName,
          itemsList: defaultItems
        });
        list.save();
        res.redirect('/' + listName);
      } else {
        //Show an existing List
        res.render("list", {listTitle: listName, items: foundList.itemsList})
      }
    }
  });
})

app.get('/about', function(req, res){
  res.render('about');
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});

app.post('/', function(req, res) {
  const toDo = req.body.toDo;
  const newItem = new Item({
    name: toDo
  });

  const listName = req.body.button;

  if (listName === 'Today') {
    newItem.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.itemsList.push(newItem);
        foundList.save();
        res.redirect('/' + listName);
      }
    });
  }
});

app.post("/delete", function(req, res) {
  const deleteItem = req.body.checkbox;
  const customName = req.body.listTitle;

  if (customName === 'Today') {

      Item.findByIdAndRemove(deleteItem, function(err){
        if(err) {
          console.log(err);
        } else{
          console.log("Deleted");
        }
      });
      res.redirect('/');
  } else {
    List.findOneAndUpdate({name: customName}, {$pull: {itemsList: {_id: deleteItem}}}, function(err, result){
    res.redirect('/' + customName);
    });

  }

});
