let key = "";
let keyMaster = "key=Ln9a4"; /*användarens inloggningsuppgifter sparas i detta bibliotek*/
let userLoggedIn = [];
let userBooks = [];
let searchBooks = [];
let countFail = 0;

window.addEventListener("load", function() {
  let btnLoggIn = document.getElementById("btnLoggIn");
  let boxlogin = document.getElementById("boxlogin");
  let http = new XMLHttpRequest();
  let i = 0;
  let title = "";
  let author = "";
  let headUserInfo = document.getElementById("headUserInfo");
  let loggOut = document.getElementById("loggOut");
  let menuText = document.getElementsByClassName("pop-up-Text")[0];
  let failCounter = document.getElementById("failCounter");

  //let loggInStatus = 0;
  //let container = document.getElementsByClassName("container")[0];
  //let userId = "";
  //let answer = "";


  let userName = document.getElementById("userName"); /*Här är användarens id*/
  let userFirstName = document.getElementById("firstName");
  let userLastName = document.getElementById("lastName");
  let userEmail = document.getElementById("userEmail");
  let userPassword = document.getElementById("userPassword"); /*Här skall nyckel sparas ner*/
  let userKey = document.getElementById("userKey");



  /* FUNKTION FÖR ATT KONTROLLERA LÖSENORD OCH LOGGA IN */
  btnLoggIn.addEventListener("click", function() {

    logInUser(0); // logInUser -> CheckUser  -> getDataFromDataBase (functions.js) = inloggad
  });


  /********************* Logga In  ********************************************/

  function logInUser (i){
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
      typ = "&op=select";


    //console.log(link + keyMaster + typ);

      fetch(link + keyMaster + typ).then(function(response){
          //console.log("hej");
          return response.json();

        }).then(function(json){
          //console.log("Hej");
          if(json.status=="error"){

            if(i<8){
              i++;
              logInUser(i);
            }else{
              failCount(i);
              console.log(" Misslyckades att logga in :< ");

            }
          }else{
            failCount(i);
            checkUser(json,0);
          }
        }).catch(function(res){
          console.log("8st försök men funkar fortfarande inte"+res);
        });

  }

  function checkUser(obj,i){   //kontrolerar lösenordet....
    let userList = []
    let j = "0";
    let found = false;
    let anvFound = false;
    console.log(obj);
    for(i=0;i<obj.data.length;i++){
      let userObj = JSON.parse(obj.data[i].title);
      userList.push(userObj);
    }


    for(i=0;i<userList.length;i++){
      //console.log(userList);
      //console.log("namn från databas"+userList[i].userId);
      //console.log("namn som skrivits in"+userName.value);
      if(userList[i].userId==userName.value){
        anvFound=true;
        if(userList[i].password===userPassword.value){
          //console.log("Rätt lösenord");
          found=true;
          j=i;
        }
      }
    }
    //console.log("unikt id"+obj.data[j].id);
    if(anvFound){
      if(!found){
        //användare hittade men felakigt lösenord
        loggMenu("Felaktigt lösenord");
        showFailMenu(userPassword,userName);
      }

    }else{
      //användare ej hittad
      showFailMenu(userName,userPassword);
      loggMenu("Användare id saknas");
    }

    if(found){ //rätt lösenord och användare.. hämta data
      //let closeLoggInMenu = document.getElementById("closeLoggInMenu");
      loggMenu("inloggad som "+ userList[j].userId);
      userLoggedIn.push(userList[j]);
      key = userList[j].key;
      //console.log(obj.data[j].updated);
      userLoggedIn.id = obj.data[j].id;
      userLoggedIn.updated = obj.data[j].updated;

      loadSettings();
      headUserInfo.innerHTML=userList[j].userId;
      document.getElementsByClassName("fa-user-circle")[0].style.color="rgb(22, 142, 8)";

      getOneUser();
      loggOut.style.display="block";

      userName.value="";
      userFirstName.value="";
      userLastName.value ="";
      userEmail.value ="";
      userPassword.value ="";
      userKey.value ="";
      userPassword.style.backgroundColor="white"
      userName.style.backgroundColor="white"
      window.location.assign("#close");

      //getDataFromDataBase(0);


    }
  }
  /********************* Logga In  END ********************************************/




  /********************* SKAPA ANVÄNDARE ***************************************/
  // makeKey --> makeUser   detta för att hinna med att få en nyckel från api:n

  let btnMakeUser = document.getElementById("btnNewUser");
  btnMakeUser.addEventListener("click",function(event){
    if(userName.value!=""){
      if(userPassword!=""){
        makeNewKey();

      }
    }


  });


  /********************** skapar en nyckel ************************************/
  function makeNewKey(i=0){

    if(userKey.value==""){  //kontrolerar om nyckeln redan är satt
          fetch("https://www.forverkliga.se/JavaScript/api/crud.php?requestKey").then(function(response){
          return response.json();
        }).then(function(json){
          if(json.status=="error"){
            if(i<8){
              i++;
              maekNewKey(i);
            }else{
              failCount(i);
              console.log("misslyckades att skapa nyckel");
            }
          }else{
            key = json.key;
            userKey.value=key;
            failCount(i);
            makeUser(0);
          }

        }).catch(function(failRes){
              loggMenu("Misslyckades att skapa nyckel");
              console.log("Försökt 8 gånger utan att lyckats skapa nyckel: "+failRes);
      });
    }else{
      key=userKey.value;
      makeUser(0);
    }

  }
  /******************  skapar en nyckel END     *******************************/

  /****************** Hämtar databas över användare *************************/
  function makeUser (i){

    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=select";


    //console.log(link + keyMaster + typ);

      fetch(link + keyMaster + typ).then(function(response){
          return response.json();
        }).then(function(json){

          if(json.status=="error"){
            if(i<8){
              i++;
              makeUser(i);
            }else{
              failCount(i);
              loggMenu("Misslyckades!");
              console.log("makeUser: Fler än 8st försök");
            }
          }else{
            failCount(i);
            checkUserInputs(json);
          }

        }).catch(function(res){
            loggMenu("Inloggning misslyckades : "+ res);
            console.log("makeUser felkod: "+res);
        });

  }


  /*****************  kontrolerar så att anv inte redan finns *****************/
  function checkUserInputs(obj){
    let userList = []
    let j = "0";
    let found=false;


    for(i=0;i<obj.data.length;i++){
      let userObj = JSON.parse(obj.data[i].title);
      userList.push(userObj);
    }
    //console.log(userList);

    for(i=0;i<userList.length;i++){
      //console.log(userList[i].userId);
      if(userList[i].userId== userName.value){

        found= true;
        console.log("Användar ID redan upptaget, vänligen välj ett nytt");
        showFailMenu(userName,userPassword);
      }

    }

    if(!found){
      //console.log(userName.value,userPassword.value,userFirstName.value,userLastName.value,userEmail.value,key);
      if(key===""){
        console.log("Misslykades med att skapa användare pga saknad nyckel");
      }else{
        let x = new User(userName.value,userPassword.value,userFirstName.value,userLastName.value,userEmail.value,key)
        x = JSON.stringify(x);
        console.log(x);

        saveNewUser(x,0);

        //logInUser(0);
        /*
        headUserInfo.innerHTML="Välkommen: " + userName.value;
        document.getElementsByClassName("fa-user-circle")[0].style.color="rgb(22, 142, 8)";
        //console.log("FUnkar.. ny user upplagd!1");
        window.location.assign("#close"); */
      }




    }
  }
  /********************* kontroll av användare END  ****************************/
  /********************  markera fel lösenord eller användare ******************/
  function showFailMenu(x,x2){
    x2.style.backgroundColor="white";
    let pos = -50;
    let inter = setInterval(frame,0.5);
    function frame(){
      if(pos==95){
        clearInterval(inter);
        //userPassword.style.backgroundColor="white";


      }else if(pos<95){
        pos++;
        x.style.left = pos + "px";
        x.style.backgroundColor="rgba(242, 0, 34, 0.61)";

      }

    }
  }
  /********************  markera fel lösenord eller användare ******************/


  /**********************  Spara Användare (skicka in objekt)*******************/

  function saveNewUser(strObj,i){
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    /* På denna nycklen lagras alla användare och lösenorden går ej att bytas ut eftersom de är kopplade till användarens bibliotek*/
    title = "&title="+ strObj;
    typ = "&op=insert";
    author="&author=not used";

      fetch(link + keyMaster + typ + title + author).then(function(response){
            return response.json();
        }).then(function(json){
          if(json.status=="error"){
            if(i<8){
              i++;
              saveNewUser(strObj,i);
            }else{
              failCount(i);
              loggMenu("Misslyckades att spara användare : "+ res);
            }
          }else{
            failCount(i);
            loggMenu("Användare Sparad!");
            console.log("Sparad!");
            console.log(json);
          }
      }).catch(function(res){
        loggMenu("Misslyckades att spara användare");
        console.log("användaren blev ej sparad felkod: " + res);
      });
  }


  /********************* Skapa Användare END **********************************/




  /**********************  lägg upp info om aktuell användare *****************/
  let settingUserName=document.getElementById("settingUserName");
  let settingUserPassword=document.getElementById("settingUserPassword");
  let settingFirstName=document.getElementById("settingFirstName");
  let settingLastName=document.getElementById("settingLastName");
  let settingUserEmail=document.getElementById("settingUserEmail");
  let settingUserKey=document.getElementById("settingUserKey");
  let settingUpdated=document.getElementById("settingUpdated");
  let settingId=document.getElementById("settingId");

  function loadSettings(){
    settingUserName.value= userLoggedIn[0].userId;
    settingUserPassword.value=userLoggedIn[0].password;
    settingFirstName.value = userLoggedIn[0].firstName;
    settingLastName.value = userLoggedIn[0].lastName;
    settingUserEmail.value = userLoggedIn[0].email;
    settingUserKey.value = userLoggedIn[0].key;
    settingUpdated.value = userLoggedIn.updated;
    settingId.value = userLoggedIn.id;
  }
  function unloadSettings(){
    settingUserName.value= "";
    settingUserPassword.value="";
    settingFirstName.value = "";
    settingLastName.value = "";
    settingUserEmail.value = "";
    settingUserKey.value = "";
    settingUpdated.value = "";
    settingId.value = "";
  }


  function updateUserSettings(strObj,i){

    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";

    id= "&id=" + userLoggedIn.id
    typ = "&op=update";
    title = "&title="+ strObj;
    author="&author=not used";
    //console.log(link + keyMaster + typ + id + title + author);

      fetch(link + keyMaster + typ + id + title + author).then(function(response){
            return response.json();
        }).then(function(json){
          if(json.status=="error"){
            if(i<8){
              i++;
              updateUserSettings(strObj,i);
            }else{
              failCount(i);
              loggMenu("Misslyckades att updatera användare : "+ res);
            }
          }else{
            failCount(i);
            loggMenu("Användare updaterad!");
            console.log("uppdaterad!");
            //console.log(json);
          }
      }).catch(function(res){
        loggMenu("Misslyckades att updatera användare");
        console.log("användaren blev ej updatera felkod: " + res);
      });
  }

  let btnsettingUpdated = document.getElementById("btnsettingUpdated");
  btnsettingUpdated.addEventListener("click",function(){
    if(key!=""){
      userLoggedIn[0].userId = settingUserName.value;
      userLoggedIn[0].password = settingUserPassword.value;
      userLoggedIn[0].firstName = settingFirstName.value;
      userLoggedIn[0].lastName = settingLastName.value;
      userLoggedIn[0].email = settingUserEmail.value;
      //settingUserKey.value = userLoggedIn[0].key;
      //settingUpdated.value = userLoggedIn.updated;
      //settingId.value = userLoggedIn.id;


      userLoggedInStr = JSON.stringify(userLoggedIn[0]);
      //console.log(userLoggedInStr);
      updateUserSettings(userLoggedInStr,0)
    }
  });








 /* Navigeringsbar visa artikel  *************************************/
 let navBar = document.getElementsByClassName("navBar");
 let article  = document.getElementsByClassName("article");
 article[0].style.display="block"; /* Denna skall bort med css*/

  let showArticle = function(event){
    parent= (event.target.parentElement);

    for(i=0;i<article.length;i++){
      if(parent.children[i]!=event.target){
          article[i].style.display="none";
          navBar[i].className="navBar";

      }else{
        navBar[i].className="navBar navBarSelected"
        article[i].style.display="block";
        if(i==2){
          initMap();
        };
      }
    }

  }


  for(i=0;i<navBar.length;i++){
    navBar[i].addEventListener("click",showArticle);
  }
 /* Navigeringsbar END  **********************************************/


 /********  Hämta Data från databasen ********************************/
 /* Nyckeln skall vara vara satt till innan denna funktion körs ex: key = "key="+"xxxxx" **/

  let loadUserLib = function (){
    http.onreadystatechange = function(){
      if(this.readyState==4){
        document.getElementsByClassName("userLib")[0].innerHTML="funkar: ";
        document.getElementsByClassName("userLib")[0].innerHTML+=http.responseText;
        console.log(JSON.parse(http.response));
      }
    }

    let typ= "op=select";
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    console.log(link+key+"&"+typ);
    http.open("GET", link+key+"&"+typ,true);
    http.send();

  }
  /************ Hämta data END  *****************************************/



  /***  Ändra användare eller lösenord i databas *******************************/
  /*
  let updateUserLib = function(){
    http.onreadystatechange = function(){
      if(this.readyState==4){
        console.log(JSON.parse(http.response));
        document.getElementsByClassName("userLib")[0].innerHTML="funkar: ";
        document.getElementsByClassName("userLib")[0].innerHTML+=http.responseText;
      }
    }

    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    keyMaster = "key=Ln9a4"
    let typ= "op=update";
    id = "id=11006";
    title="title=Erik";
    author = "author=hVfr2"

    console.log(link + keyMaster +"&"+ typ +"&"+ id +"&"+ title +"&"+ author);
    http.open("GET",link + keyMaster +"&"+ typ +"&"+ id +"&"+ title +"&"+ author,true);
    http.send();
  }
  /************************ Uppdatatera END *******************************/


  /*******************  Lägg till i databas  ********************************/
  /*
  let addToUserLib = function (){
    http.onreadystatechange = function(){
      if(this.readyState==4){
        document.getElementsByClassName("userLib")[0].innerHTML="funkar: ";
        document.getElementsByClassName("userLib")[0].innerHTML+=http.responseText;
        console.log(JSON.parse(http.response));
      }
    }

    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    let typ= "op=insert";
    title="title=zyTCAlFPjgYC";
    author="author=GoogleBooks";


    console.log(link+key+"&"+typ+"&"+title+"&"+author);
    http.open("GET", link+key+"&"+typ+"&"+title+"&"+author,true);

    http.send();

  }

  */

  /********************   Lägg till END   *************************************/


  /*******************  Logga Ut Användare ***********************************/


    loggOut.addEventListener("click",function(event){
      if (key!==""){
        headUserInfo.innerHTML="Ej Inloggad";
        document.getElementsByClassName("fa-user-circle")[0].style.color="rgb(142, 0, 0)";
        key="";
        event.target.style.display="none";
        let userBooks = [];
        listBooks.innerHTML="";
        unloadSettings();
      }

    });

  /*******************  Logga ut Avnändare END *******************************/

  /********************  Hämta data från Google books  **********************/

  function searchGoogle(event,searchForStr){
    //event skickas med från addEventListener konstigt nog.. därav ligger den med här men används ej

    let searchStr="";
    let resultSearchBooks = document.getElementById("resultSearchBooks");
    resultSearchBooks.innerHTML="";
    let searchTitelTextInput = document.getElementById("searchTitelTextInput");
    let searchAutorTextInput = document.getElementById("searchAutorTextInput");

    if(searchForStr!=undefined){             //om str medskickad till funktion
      searchStr =searchForStr;
      //console.log(searchForStr);
    }else{
      if(searchTitelTextInput.value){
        searchStr= searchTitelTextInput.value
      }
      if(searchAutorTextInput.value) {
        searchStr+="+inauthor:"+searchAutorTextInput.value;
      }
    }

    searchStr+="&printType=books"
    let link = "https://www.googleapis.com/books/v1/volumes?q=";
    //console.log(link+searchStr);

    fetch("https://www.googleapis.com/books/v1/volumes?q="+searchStr+"&key=AIzaSyCeCWE-_JEPML1urQm5_jMtzTiebFZ_4lc")
      .then(function(result){
        return result.json();
      }).then(function(json){
        //console.log(json);
        if(json.totalItems!= 0){

          createBooks(json);
        }else {
          console.log("0 träffar");
        }
      }).catch(function(str){
        console.log(str);
      });

  }

  /********************** Funktion för att skapa book li element *********************/

  function createBooks(result,myOwnBook){
    //console.log(result+ myOwnBook);
    let textsnippet ="";
    let output ="";
    let biblo = true;


    if(myOwnBook!=undefined){
      //console.log("egen bok");
      output = document.getElementById("listBooks");
      biblo = false;
      buildBook(myOwnBook);
    }else{

      output = document.getElementById("resultSearchBooks");
      for(i=0;i<result.items.length;i++){
        let book = {};
        x = result.items[i];
        book.description = x.volumeInfo.description;
        book.infoLink = x.volumeInfo.infoLink;
        book.bookTitel = x.volumeInfo.title
        book.searchSnippet = "Saknar beskrivande text"
        book.Id=x.id;
        book.authors = "";
        for(j = 0; j< x.volumeInfo.authors.length; j++){
          book.authors += x.volumeInfo.authors[j];
        }

        book.imgSrc ="http://books.google.com/books/content?id=nPJGEKuANX8C&printsec=frontcover&img=1&zoom=5&source=gbs_api"

        if(x.volumeInfo.hasOwnProperty("imageLinks")){
          if(x.volumeInfo.imageLinks.hasOwnProperty("smallThumbnail")){
            if(x.volumeInfo.imageLinks.smallThumbnail!=undefined){
              book.imgSrc = x.volumeInfo.imageLinks.smallThumbnail;

            }else{
            }
          }
        }
        if(x.hasOwnProperty("searchInfo")){
          if(x.searchInfo.hasOwnProperty("textSnippet")){
            book.searchSnippet = x.searchInfo.textSnippet;
          }
        };

        buildBook(book);
      }
    }


    function buildBook(book){
      //console.log(biblo);
      let list = document.createElement("li",{id:"books"});
      let img = document.createElement("img");
      let button  = document.createElement("button");
      let div = document.createElement("div");
      let span = document.createElement("span");
      div.className="books";


      span.innerHTML= book.Id;
      if (biblo) {
        button.className="btnAddToShell";
      }else {

        button.className="knappTabort";
      }


      img.src=book.imgSrc;
      list.appendChild(div);
      div.appendChild(img);
      div.innerHTML+="<br><a href="+book.infoLink +" target=_blank><h3>" + book.bookTitel +"</h3></a><br>"+
          book.searchSnippet + "<br><br>"+"<h4>Sammanfattning: </h4><br>"+ book.description + "<br><br> <strong> Författare: </strong> <p>"+book.authors +"</p> <br> <strong>Google ID: <br></strong>" ;
      div.appendChild(span);
      output.appendChild(list);
      list.appendChild(button);






      if(biblo){

        let btnAddToShell = document.getElementsByClassName("btnAddToShell")[i];
        btnAddToShell.addEventListener("click",function(){
          let li = event.target.parentElement;
          //let uniqueBook = li.querySelector("span").innerHTML;
          let uniqueBook = new CreateBooks(li.querySelector("h3").innerHTML, li.querySelector("p").innerHTML);
          if (key!="")
            addBookToLibarary(uniqueBook,0);

        });
      }else{
        console.log("antal böecker: "+userBooks.length);
        let numberOfBooks = userBooks.length
        let knappTaBort = document.getElementsByClassName("knappTabort")[numberOfBooks];
        knappTaBort.addEventListener("click",function(){
          console.log(event.target.parentElement);
          let li = event.target.parentElement;
          let uniqueBook = li.querySelector(".uniqueBook").innerHTML;

          removeBook(uniqueBook, li,0);
          console.log("remove knapp tillagd");
        })


      };

    }
  };
  /*********************     skapa li bok elemnt END ***********************/

  mouseLeaveFunction();


  /********************** lägg bok i databasen ****************************/

  function addBookToLibarary(uniqueBook,i){
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=insert";
    title = "&title="+(uniqueBook.titel);
    author = "&author="+(uniqueBook.author);

      fetch(link +"key="+ key + typ + title + author).then(function(response){
          return response.json();
        }).then(function(json){
          console.log(json);
          if(json.status=="error"){
            if(i<12){
              i++;
              addBookToLibarary(uniqueBook,i);
            }else{
              failCount(i);
              console.log(json);
              console.log("misslyckades att lägga till bok i användarens databas");
            }
          }else{
            //console.log("add to libarary "+ uniqueBook);
            console.log("sparad");
            failCount(i);
            getOneUser();

          }
        }).catch(function(res){
          console.log("Efter 8st försök men går fortfarande inte: "+res);
      });

  };












  /********************  Hämta data från Google books   END      *************/





  /********************* Hämta Alla användare *********************************/
  function getAllUsers(i){

    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=select";

      fetch(link + keyMaster + typ).then(function(response){
          return response.json();
        }).then(function(json){
          if(json.status=="error"){
            if(i<8){
              i++;
              getAllUsers(i);
            }else{
              console.log(json);
              failCount(i);
              console.log("misslyckades att hämta alla användare");
            }
          }else{
            failCount(i);
            console.log(json);
          }
        }).catch(function(res){
          console.log("Efter 8st försök men går fortfarande inte: "+res);
        });

  };




  /********************* Hämta Alla användare END *****************************/


  /********************* Hämta EN användares Biblo *********************************/
  function getOneUser(i=0){


    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=select";


    fetch(link + "key="+key + typ).then(function(response){
      return response.json();
    }).then(function(json){
      if(json.status=="error"){
        if(i<12){
          i++;
          getOneUser(i);
        }else{
          failCount(i);
          console.log(json);
          console.log("misslyckades att hämta data för användare")
        }
      }else{
        console.log(json);
        userBooks=json.data;
        failCount(i);
        makeUserBookLiberary();
      }
    }).catch(function(res){
      console.log("Efter 8st försök men går fortfarande inte: "+res);
    });



  };




  /********************* Hämta Alla användare END *****************************/



  /********************* Remove book ******************************************/
  function removeBookManualy(x){
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=delete";
    id= "&id="+x;


      fetch(link + "key="+key + typ + id).then(function(response){
          return response.json();
        }).then(function(json){
          console.log(json);

        }).catch(function(res){
            console.log("8st försök utan att lyckas"+ res);
        });

  };


  /********************* Remove book END ************************************/

  /********************* Remove user ******************************************/
  function removeUserManualy(x,i=0){
    let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
    typ = "&op=delete";
    id= "&id="+x;


      fetch(link + keyMaster + typ + id).then(function(response){
          return response.json();
        }).then(function(json){
          console.log(json);
          if(json.status=="error"){
            if(i<12){
              i++;
              removeUserManualy(x,i);
            }else{
              failCount(i);
              console.log(json);
              console.log("misslyckades att ta bort användare")
            }
          }
        }).catch(function(res){
            console.log("8st försök utan att lyckas"+ res);
        });

  };


  /********************* Remove user END ************************************/



  /********************  MakeOwnBook Start **********************************/

  function makeOwnBook(){
    let a = document.getElementById("myBookTitle").value;
    let b = document.getElementById("myBookAuthor").value;

    /*
    let c = document.getElementById("myBookid").value;
    let d = document.getElementById("myBookLink").value;
    let e = document.getElementById("myBoookDescription").value;
    let f = document.getElementById("myBookSearchSnippet").value;
    let g = document.getElementById("myBookImgSrc").value;
    let h = document.getElementById("myBookServer").value;
    */
    let uniqueBook = new CreateBooks(a,b);

    //console.log(newBook);
    //createBooks(false,newBook);
    addBookToLibarary(uniqueBook,0);

  }






  let btnMakeOwnBook = document.getElementById("btnMakeOwnBook");
  btnMakeOwnBook.addEventListener("click",function(){
    //console.log("make own book");
    if(key!=""){
      makeOwnBook();
    }
  })

  let btnSearchGoogle = document.getElementById("btnSearchGoogle");
  btnSearchGoogle.addEventListener("click",function(event){
    if(searchTitelTextInput.value!="" || searchAutorTextInput.value!="")
      searchGoogle();

  });






  //let johan = new User("johan80","admin","johan","Augustsson","zingo80@msn.com","fe7Hz");
  //console.log(johan);
  //let johanStr = (JSON.stringify(johan));


  // **  Funktioner som körs när man kommer till sidan ************************//
  //saveNewUser(johanStr);
  i=0;
  getAllUsers(i);
  //getOneUser("key=wWTnh",0);

  //logInUser();
  //removeBookManualy(15068);
  //makeNewKey();
  //removeUserManualy(26346);



  searchGoogle("","liza marklund");

  function loggMenu(str){
    menuText.innerHTML=str
    setTimeout(function(){
        menuText.innerHTML="";

    },3000);

  }


    function removeBook(uniqueBook, li, i) {

      let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
      typ = "&op=delete";
      id = "&id=" + uniqueBook;


      fetch(link + "key=" + key + typ + id).then(function(response) {
        return response.json();

      }).then(function(json) {
        //console.log(json);

        if (json.status == "error") {

          if (i < 20) {
            i++
            removeBook(uniqueBook, li, i);
          }else{
            failCount(i);
            console.log("misslyckades att ta bort bok");
          }
        } else {
          failCount(i);
          listBooks.removeChild(li);

        }

      }).catch(function(res) {

      });
    };

  // nedan är de nya funktionerna för labb 4 för VG 2017-12-10

  function makeUserBookLiberary(){

  output = document.getElementById("listBooks");
  output.innerHTML = "";

  for(i = 0; i < userBooks.length; i++){


    let book = {};
    x = userBooks[i];

    book.description = "";
    book.infoLink = "";
    book.title = x.title;
    book.author = x.author;
    book.Id= x.id;
    book.imgSrc = "http://books.google.com/books/content?id=7zsJAAAAQAAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api";

    /*
    if(x.volumeInfo.imageLinks.smallThumbnail!=undefined)
    book.imgSrc = x.volumeInfo.imageLinks.smallThumbnail;

    if(x.hasOwnProperty("searchInfo")){
      if(x.searchInfo.hasOwnProperty("textSnippet")){
        book.searchSnippet = x.searchInfo.textSnippet;
      }
    };
    */
    let list = document.createElement("li",{id:"books"});
    let img = document.createElement("img");
    let button  = document.createElement("button");
    let div = document.createElement("div");
    let span = document.createElement("span");
    div.className="books";
    button.className="knappTabort";
    span.innerHTML = book.Id;
    img.src=book.imgSrc;
    list.appendChild(div);
    div.appendChild(img);
    //div.innerHTML+="<br><a href=# target=_blank><h3>" + book.bookTitel +
    // book.description +"<br> Google ID: "+ book.bookTitel + "<br> Databas Id: ";
    div.innerHTML+="<h3 class=title>"+book.title + "</h3></a><p class=author>"+ book.author + "<p><br>"+"<h4>Sammanfattning: </h4><br>"+
      book.description +"<br> Databas Id: ";
    div.appendChild(span);
    output.appendChild(list);
    list.appendChild(button);





    let changeTitle = document.getElementsByClassName("title")[i];
    let replaceNode="";

    changeTitle.addEventListener("click",function(event){
      let a = event.target;
      let parent = event.target.parentNode
      let x = document.createElement("input");
      x.id="title";
      x.value= a.innerText;
      replaceNode = parent.replaceChild(x,a);
      x.focus();
      let changeTitle2 = document.getElementById("title");
      //console.log(changeTitle2);
      changeTitle2.addEventListener("blur",function(event){
        //console.log("funkar!!")
        replaceNode.innerText= x.value;
        replaceNode = parent.replaceChild(replaceNode,x);
        //console.log(book.Id,x.value,book.author);
        updateBookInLibarary(book.Id, x.value, book.author);
      });
    });


    let changeAuthor = document.getElementsByClassName("author")[i];
    changeAuthor.addEventListener("click",function(event){
      let a = event.target;
      let parent = event.target.parentNode
      let x = document.createElement("input");
      x.id="author";
      x.value= a.innerText;
      replaceNode = parent.replaceChild(x,a);
      x.focus();
      let changeAuthor2 = document.getElementById("author");
      //console.log(changeAuthor2);
      changeAuthor2.addEventListener("blur",function(event){
        //console.log("funkar!!")
        replaceNode.innerText= x.value;
        replaceNode = parent.replaceChild(replaceNode,x);
        updateBookInLibarary(book.Id, book.title ,x.value);
      });
    });

    //btnRemoveBook.innerHTML = "Click to Remove Book";

    let knappBort = document.getElementsByClassName("knappTabort")[i];
    //console.log(x);
    //console.log(knappBort);
    //console.log(output);
    knappBort.addEventListener("click",
    function(event) {

      //console.log(event.target.parentElement);

      let li = event.target.parentElement;
      let uniqueBook = li.querySelector("span").innerHTML;
      //console.log(uniqueBook);

      removeBook(uniqueBook, li, 0);
      //getOneUser();
    })
  }
  }

      function updateBookInLibarary(id,titel,author,i=0){
        let link = "https://www.forverkliga.se/JavaScript/api/crud.php?";
        typ = "&op=update";
        id = "&id="+(id);
        title = "&title="+(titel);
        author = "&author="+(author);
        //console.log(link +"key="+ key + typ + id + title + author);

          fetch(link +"key="+ key + typ + id + title + author).then(function(response){
              return response.json();
            }).then(function(json){
              //console.log(json);
              if(json.status=="error"){
                if(i<20){
                  i++;
                  updateBookInLibarary(id,titel,author,i);
                }else{
                  failCount(i);
                  console.log(json);
                  console.log("misslyckades att uppdatera bok")
                }
              }else{
                //console.log("add to libarary "+ uniqueBook);
                console.log("sparad");
                failCount(i);
                getOneUser();

              }
            }).catch(function(res){
              console.log("Efter 20st försök men går fortfarande inte: "+res);
          });
      };

    function failCount(x){
      countFail += x;
      failCounter.innerText= countFail;
    }
});


/************** Mouse leave scroll top funktion ***********/
  function mouseLeaveFunction() {
    let books = document.getElementsByClassName("books");

    for(i=0;i<books.length;i++){
      books[i].addEventListener("mouseout",function(event){
        event.target.scrollTop=0;
      });

    }


  }

/***********END Mouser leave scroll top funktion END ******/



/************  Skapa användare med classes  *********************/

class User {
  constructor(myUserId,myPassword,myName,myLastName,myEmail,myKey){
    this.userId=myUserId;
    this.firstName=myName;
    this.lastName=myLastName;
    this.email=myEmail;
    this.password=myPassword;
    this.key=myKey;
  }

};

class CreateBooks{
  constructor(myBookTitel,myBookAuthor){
    //this.id= myBookId;
    this.titel = myBookTitel;
    this.author = myBookAuthor;
    //this.infoLink = myBookLink;
    //this.description = myBookDescription;
    //this.searchSnippet = myBookSearchSnippet;
    //this.imgSrc = myBookImgSrc;
    //this.server = myServer;

  }

};
