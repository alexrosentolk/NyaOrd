const API_URL =
"https://script.google.com/macros/s/AKfycbzwOTEr31q6oqvfirh7sA7M_HRCbm66C6FLkGN8bGGz0ZxNTvV_5ynvn082RUuiJj7H/exec";


let currentLanguage = "svenska";

let words = [];

let quizWords = [];

let quizIndex = 0;





// ==========================
// SPRÅK
// ==========================


const languageTitles = {

svenska:{
title:"NyaOrd",
subtitle:"Samla organisera och repetera ord"
},

engelska:{
title:"NewWords",
subtitle:"Collect, organize and review words"
},

franska:{
title:"NouveauxMots",
subtitle:"Collecter, organiser et réviser les mots"
},

spanska:{
title:"NuevasPalabras",
subtitle:"Recopila, organiza y repasa palabras"
},

tyska:{
title:"NeueWörter",
subtitle:"Sammle, organisiere und wiederhole Wörter"
},

arabiska:{
title:"كلمات جديدة",
subtitle:"اجمع ونظم وراجع الكلمات"
},

nederlands:{
title:"NieuweWoorden",
subtitle:"Verzamel, organiseer en herhaal woorden"
}

};







// ==========================
// SPRÅKVAL
// ==========================


function selectLanguage(language){

    currentLanguage = language;


    document.getElementById("languageTitle").textContent =
    languageTitles[language].title;


    document.getElementById("languageSubtitle").textContent =
    languageTitles[language].subtitle;


    showPage("homePage");

}







// ==========================
// DATAHANTERING
// ==========================


async function loadWords(){

    let message =
    document.getElementById("loadingMessage");


    if(message){

        message.textContent =
        "Hämtar ord...";

    }


    try {


        const response =
        await fetch(API_URL);


        const data =
        await response.json();



        words =
        data.filter(item =>

            item.language.toLowerCase()
            === currentLanguage.toLowerCase()

        );



        console.log("Inlästa ord:", words);



        if(message){

            message.textContent =
            words.length +
            " ord laddade";

        }



        setTimeout(()=>{

            if(message){

                message.textContent="";

            }

        },2000);



    }


    catch(error){


        console.error(
            "Kunde inte läsa kalkylarket:",
            error
        );


        if(message){

            message.textContent =
            "Kunde inte hämta ord";

        }


        words=[];


    }

}







async function sendWordToSheet(wordData){


    await fetch(API_URL, {

        method:"POST",

        body:JSON.stringify(wordData)

    });


}







// ==========================
// NAVIGATION
// ==========================


function showPage(pageId){


    document.querySelectorAll(".page")
    .forEach(page=>{

        page.classList.remove("active");

    });



    document.getElementById(pageId)
    .classList.add("active");



    if(pageId==="homePage"){

        resetQuiz();

    }


}







function backToHome(){


    resetQuiz();

    showPage("homePage");


}







function backFromAddPage(){


    clearInputs();

    showPage("homePage");


}







function backToQuizSettings(){

    quizWords=[];

    quizIndex=0;


    quizContent.innerHTML="";

    quizCounter.innerHTML="";


    document.getElementById("quizSetup").style.display="block";


    document.getElementById("restartQuizButton").style.display="none";


    document.getElementById("quizSettingsButton").style.display="none";


    document.getElementById("startQuizButton").textContent="Starta";

}








// ==========================
// LÄGG TILL ORD
// ==========================


async function saveWord(){


    await loadWords();



    let word =
    wordInput.value.trim();




    let existingWord =

    words.some(w =>

        w.word.trim().toLowerCase()
        ===
        word.trim().toLowerCase()

    );




    if(existingWord){


        alert("Det här ordet finns redan");


        return;


    }






    let meaning =
    meaningInput.value.trim();


    let example =
    exampleInput.value.trim();


    let hide =
    hideInput.value.trim();


    let week =
    weekInput.value;


    let year =
    yearInput.value;





    if(!word || !meaning || !week || !year){


        alert("Fyll i obligatoriska fält");


        return;


    }






    let newWord = {


        action:"add",


        word:word,


        meaning:meaning,


        example:example,


        hide:hide,


        week:week,


        year:year,


        language:currentLanguage


    };



    sendWordToSheet(newWord);



    clearInputs();


    alert("Ordet sparades");


}







function clearInputs(){


    wordInput.value="";

    meaningInput.value="";

    exampleInput.value="";

    hideInput.value="";

    weekInput.value="";

    yearInput.value="";


}

// ==========================
// ORDLISTA
// ==========================


async function openWordList(){

    await loadWords();

    populateFilters();

    renderWordList();

    showPage("listPage");

}





function populateFilters(){


    let weeks =
    [...new Set(words.map(w=>w.week))];


    let years =
    [...new Set(words.map(w=>w.year))];



    weekFilter.innerHTML =
    "<option value=''>Alla veckor</option>";


    yearFilter.innerHTML =
    "<option value=''>Alla år</option>";



    quizWeek.innerHTML =
    "<option value=''>Vecka</option>";


    quizYear.innerHTML =
    "<option value=''>År</option>";





    weeks.forEach(w=>{


        weekFilter.innerHTML +=
        `<option>${w}</option>`;


        quizWeek.innerHTML +=
        `<option>${w}</option>`;


    });





    years.forEach(y=>{


        yearFilter.innerHTML +=
        `<option>${y}</option>`;


        quizYear.innerHTML +=
        `<option>${y}</option>`;


    });


}







function renderWordList() {

    let container = document.getElementById("wordContainer");

    container.innerHTML = "";

    let list = [...words];

    // Hämta valen från rullistorna
    let selectedWeek = document.getElementById("weekFilter").value;
    let selectedYear = document.getElementById("yearFilter").value;

    // FILTRERA VECKA
    if (selectedWeek !== "") {

        list = list.filter(item =>
            String(item.week).trim() === String(selectedWeek).trim()
        );

    }

    // FILTRERA ÅR
    if (selectedYear !== "") {

        list = list.filter(item =>
            String(item.year).trim() === String(selectedYear).trim()
        );

    }


    // ==========================
    // SORTERING
    // ==========================

    let sort = document.getElementById("sortSelect").value;


    if (sort === "az") {

        list.sort((a, b) =>
            String(a.word).localeCompare(
                String(b.word),
                "sv"
            )
        );

    }


    if (sort === "newest") {

        list.sort((a, b) =>
            Number(b.row) - Number(a.row)
        );

    }


    if (sort === "oldest") {

        list.sort((a, b) =>
            Number(a.row) - Number(b.row)
        );

    }


    // ==========================
    // VISA ORDEN
    // ==========================

    if (list.length === 0) {

        container.innerHTML =
            "<p>Inga ord hittades för det valda filtret.</p>";

        return;

    }


    list.forEach(item => {

        container.innerHTML += `

        <div class="word-card">

            <h3>${item.word}</h3>

            <p>
                <b>Betydelse:</b><br>
                ${item.meaning}
            </p>

            <p>
                <b>Exempel:</b><br>
                ${item.example || "-"}
            </p>

            <p>
                <b>Döljs:</b><br>
                ${item.hide || "-"}
            </p>

            <p>
                Vecka ${item.week}
                År ${item.year}
            </p>

            <button onclick="startEdit(${item.row})">
                Ändra
            </button>

            <button onclick="deleteWord(${item.row})">
                Ta bort
            </button>

        </div>

        `;

    });

}








// ==========================
// ÄNDRA / TA BORT
// ==========================


async function deleteWord(row){


    if(!confirm("Ta bort ordet?")){

        return;

    }



    await fetch(API_URL, {


        method:"POST",


        body:JSON.stringify({

            action:"delete",

            row:row

        })


    });



    await loadWords();


    renderWordList();



    alert("Ordet har tagits bort.");


}









function startEdit(row){


    let item =
    words.find(w=>w.row===row);



    let container =
    document.getElementById("wordContainer");



    container.innerHTML = `


    <div class="word-card">



    <input id="editWord"
    value="${item.word}">



    <textarea id="editMeaning">
    ${item.meaning}
    </textarea>



    <textarea id="editExample">
    ${item.example || ""}
    </textarea>



    <input id="editHide"
    value="${item.hide || ""}">



    <input id="editWeek"
    value="${item.week}">



    <input id="editYear"
    value="${item.year}">



    <button onclick="saveEdit(${item.row})">

    Spara ändring

    </button>




    <button onclick="renderWordList()">

    Avbryt

    </button>



    </div>


    `;


}









async function saveEdit(row){



    let item =
    words.find(w=>w.row===row);




    let updatedWord = {


        action:"edit",


        row:row,


        word:
        document.getElementById("editWord").value,


        meaning:
        document.getElementById("editMeaning").value,


        example:
        document.getElementById("editExample").value,


        hide:
        document.getElementById("editHide").value,


        week:
        document.getElementById("editWeek").value,


        year:
        document.getElementById("editYear").value,


        language:
        item.language


    };





    await fetch(API_URL, {


        method:"POST",


        body:JSON.stringify(updatedWord)


    });




    await loadWords();


    renderWordList();


}








// ==========================
// FÖRHÖR
// ==========================


async function openQuizSetup(){


    await loadWords();


    populateFilters();


    showPage("quizPage");


}







function startQuiz(){



    document.getElementById("startQuizButton").textContent =
    "Börja om";



    quizWords = words.filter(w => {

    let weekMatches =
        quizWeek.value === "" ||
        String(w.week).trim() === String(quizWeek.value).trim();

    let yearMatches =
        quizYear.value === "" ||
        String(w.year).trim() === String(quizYear.value).trim();

    return weekMatches && yearMatches;

});






    if(quizOrder.value==="random"){


        quizWords.sort(()=>

            Math.random()-0.5

        );


    }

    else {


        quizWords.sort((a,b)=>

            a.row-b.row

        );


    }






    if(quizWords.length===0){


        alert("Inga ord hittades");


        return;


    }





    quizIndex=0;




    document.getElementById("quizSetup").style.display="none";


    document.getElementById("restartQuizButton").style.display="block";


    document.getElementById("quizSettingsButton").style.display="block";



    showQuestion();


    updateQuizCounter();



}









function updateQuizCounter(){


    quizCounter.textContent =

    "Genomförda "

    + quizIndex

    +" av "

    + quizWords.length;


}









function showQuestion(){


    let item =
    quizWords[quizIndex];



    let example =
    item.example || "-";




    if(item.hide){


        example =
        example.replace(

            new RegExp(item.hide,"gi"),

            "_____"

        );


    }






    quizContent.innerHTML = `


    <p>
    <b>Betydelse:</b><br>
    ${item.meaning}
    </p>



    <p>
    <b>Exempel:</b><br>
    ${example}
    </p>




    <input id="answerInput">



    <button onclick="checkAnswer()">

    Svara

    </button>



    <div id="result"></div>



    `;


}









function checkAnswer(){



    let answer =
    answerInput.value
    .trim()
    .toLowerCase();




    let correct =
    quizWords[quizIndex]
    .word
    .toLowerCase();





    if(answer===correct){


        result.innerHTML="Rätt ✓";


    }

    else {


        result.innerHTML =

        "Fel ✗ Rätt svar: "

        + quizWords[quizIndex].word;


    }







    setTimeout(()=>{



        quizIndex++;




        if(quizIndex>=quizWords.length){


            quizContent.innerHTML=
            "<h3>Förhör klart!</h3>";



            quizCounter.textContent =

            "Klart! "

            +quizWords.length

            +" av "

            +quizWords.length;



            return;


        }





        updateQuizCounter();


        showQuestion();



    },1200);



}









// ==========================
// ÅTERSTÄLLNING
// ==========================


function resetQuiz(){



    quizWords=[];


    quizIndex=0;



    if(quizContent)

    quizContent.innerHTML="";



    if(quizCounter)

    quizCounter.innerHTML="";





    let button =
    document.getElementById("startQuizButton");



    if(button){


        button.textContent="Starta";


    }





    document.getElementById("quizSetup").style.display="block";


    document.getElementById("restartQuizButton").style.display="none";


    document.getElementById("quizSettingsButton").style.display="none";


}

// ==========================
// RETUR = SVARA I FÖRHÖR
// ==========================

document.addEventListener("keydown", function(event) {

    if (event.key !== "Enter") {
        return;
    }

    // Kontrollera att vi faktiskt är i förhörsläget
    if (!document.getElementById("quizPage").classList.contains("active")) {
        return;
    }

    // Kontrollera att svarsfältet finns
    let answerInput = document.getElementById("answerInput");

    if (!answerInput) {
        return;
    }

    // Undvik att Enter gör någon annan standardåtgärd
    event.preventDefault();

    // Kör exakt samma funktion som "Svara"-knappen
    checkAnswer();

});
