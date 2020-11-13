// Create setKata array //
const setKata = [];
// setKata predicate for set data type
function isMember(member) {
    let found = false;
    for (let i = 0; i < setKata.length; i++) {
        if (setKata[i] === member) {
            found = true;
            break;
        }
    }
    return found;
}
// file upload //
var loaderSelected = (e) => {
    let file = e.target.files;
    let show = `Selected file : ${file[0].name}`;
    let output = document.getElementById('selected-file-span');
    let chooseFileGone = document.getElementById("custom-message");
    output.innerHTML = show;
    chooseFileGone.innerHTML = "";
    output.classList.add("active");
    chooseFileGone.classList.add("active");
};

// add event listener for file input
let fileInput = document.getElementById("fileHandler");
fileInput.addEventListener("change", loaderSelected);
//****//

// Main search listener //
const mainSearchButton = document.getElementById('main-search-button');
mainSearchButton.addEventListener('click', async (e) => {
    const searchInput = document.getElementById("main-search-bar").value.split(/\s/);
    const response = await fetch(`./search?`, { 
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({searchInput})
    });
    const responseJSON = await response.json();
    const fileObjectContainer = responseJSON.fileObjectContainer;

    // show result header
    showResultHeader();

    // creating matrix terms
    getMatriksTerm(searchInput, fileObjectContainer);
    console.log(setKata);

    // creating matrix term for query
    const matrixQuery = [];
    for (let i = 0; i < setKata.length; i++) {
        matrixQuery.push(0);
        if (i <= searchInput.length) {
            searchInput.forEach( word => {
                if (word.toLowerCase() == setKata[i]) {
                    matrixQuery[i]++;
                }
            })
        }
    }
    // console.log(matrixQuery);
    
    // creating matrix terms for each docs
    getMatriksDocuments(fileObjectContainer) ;   

    // creating cosine similarity for each docs
    fileObjectContainer.forEach(fileObject => {
        getCosineSimilarity(matrixQuery, fileObject);
    });

    // sorting descending to its similarity value 
    fileObjectContainer.sort((a, b) => {
        return b.similarity - a.similarity;
    })

    // print results to html
    printResult(fileObjectContainer);
    console.log(fileObjectContainer);
});

function showResultHeader() {
    const searchInputText = document.getElementById("main-search-bar").value;
    const resultHeader = document.getElementById('result-header');
    resultHeader.innerHTML = `<h1 class="text-title container" id="SearchQuery">Your search on "${searchInputText}"</h1>
    <h3 class="mx-4">Results: </h3>
    <div class="bg-light text-dark py-4">
        <div class="mx-4 result row" id="result-section">

        </div>
    </div>`;

}

// Filling setKata array //
function getMatriksTerm(searchInput, fileObjectContainer) {
    searchInput.forEach(element => {
        if (!isMember(element.toLowerCase())) {
            setKata.push(element.toLowerCase());
        }
    });
    fileObjectContainer.forEach( fileObject => {
        fileObject.arrayKata.forEach( kata => {
            if (!isMember(kata)) {
                setKata.push(kata);
            }
        });
    });
}

// Creating matrix terms for each document //
async function getMatriksDocuments(fileObjectContainer) {
    await fileObjectContainer.forEach( fileObject => {
        var matrixTermDoc = [];
        for (let i = 0; i < setKata.length; i++) {
            matrixTermDoc.push(0);
            fileObject.arrayKata.forEach( word => {
                if (word === setKata[i]) {
                    matrixTermDoc[i]++;
                }
            })
        }
        fileObject.matrixTerms = matrixTermDoc;
    });
}

// Calculates cosine similarity for a fileObject (parameter is a single fileObject)
function getCosineSimilarity(matrixQuery, fileObject) {
    var dotProduct = 0;
    var queryMagnitude = 0;
    var docMagnitude = 0;
    for (let i = 0; i < setKata.length; i++) {
        dotProduct += matrixQuery[i] * fileObject.matrixTerms[i];
        queryMagnitude += Math.pow(matrixQuery[i], 2);
        docMagnitude += Math.pow(fileObject.matrixTerms[i], 2);
    }
    
    queryMagnitude = Math.sqrt(queryMagnitude);
    docMagnitude = Math.sqrt(docMagnitude);
    // console.log(`dot product: ${dotProduct}`);
    // // console.log(queryMagnitude);
    // console.log(`doc magnitude: ${docMagnitude}`);
    const cosinesimilarity = dotProduct/(queryMagnitude * docMagnitude);
    fileObject.similarity = cosinesimilarity;
    // console.log(`${fileObject.filename}, similarity: ${fileObject.similarity}`);
}

//  print results to html
function printResult(fileObjectContainer) {
    const resultItemSpan = document.getElementById('result-section');
    fileObjectContainer.forEach(resultItem => {
        resultItemSpan.innerHTML += 
        `<div class="card col-md-12 col-sm-12 col-lg-12" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">${resultItem.filename}</h5>
                <p class="card-text">Words count: ${resultItem.banyakKata}</p>
                <p class="card-text">Similarity: ${resultItem.similarity*100}%</p>
                <p class="card-text">First sentence: ${resultItem.firstSentence}</p>
                </div>
        </div>`
    })
}


