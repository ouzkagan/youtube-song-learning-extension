// chrome.extension.sendMessage({}, function(response) {
// 	var readyStateCheckInterval = setInterval(function() {
// 	if (document.readyState === "complete") {
// 		clearInterval(readyStateCheckInterval);

// 		// let div = document.createElement("div");
// 		// div.innerHTML = "timestamps"

// 		// document.querySelector("#related #items").prepend(div)

// 		// ----------------------------------------------------------
// 		// This part of the script triggers when page is done loading
// 		console.log("Hello. This message was sent from scripts/inject.js");
// 		// ----------------------------------------------------------

// 	}
// 	}, 10);
// });
// // if url change via js
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   // listen for messages sent from background.js
//   console.log(request.message)  
//   if (request.message === "tab_changed") {
//     alert('sad')
//     console.log('tab changed')
//     init();
//   }
//   return true
// });


// visible extension
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  console.log(msg.command)
  if (msg.command === "tab_changed") {
    init();
    return true;
  }
  if (msg.command == "disableExtension") {
    localStorage["youtube_song_memorizer_settings"] = JSON.stringify({
      disabled: true,
    });
    document.querySelector("#youtube-song-memorizer").style.display = "none";
  }
  if (msg.command == "enableExtension") {
    localStorage["youtube_song_memorizer_settings"] = JSON.stringify({
      disabled: false,
    });
    document.querySelector("#youtube-song-memorizer").style.display = "inline";
  }
  return true;
});






const init = function () {
  if (!window.location.href.includes('watch')){
    return
  }
  setTimeout(function () {
    // base div
    let div = document.createElement("div");

    // check local storage
    const localId =
      "yt_song_memorizer" +
      window.location
        .toString()
        .replace("https://www.youtube.com/watch?v=", "");
    const exLocalData = localStorage.getItem("youtube_song_memorizer");

    let parsedLoopData = "";
    let parsedExLocalData = "";
    let existingLoop = `
		<div class="loop-container loop-container-1" data-number="1"> 
			<input type="text" class="loop-start" placeholder="0:15">to <input type="text" class="loop-end" placeholder="0:30">
			<input type="button" value="start" id="startloop">
			<input type="button" value="remove" id="removeloop">
		</div>
		`;
    if (exLocalData !== null) {
      parsedExLocalData = JSON.parse(exLocalData);

      if (localId in parsedExLocalData) {
        parsedLoopData = parsedExLocalData[localId];
        existingLoop = parsedLoopData
          .map((item, index) => {
            return `
				<div class="loop-container loop-container-${index + 1}" data-number="${
              index + 1
            }"> 
					<input type="text" class="loop-start" placeholder="0:15" value=${
            item[0]
          }>to <input type="text" class="loop-end" placeholder="0:30" value=${
              item[1]
            }>
					<input type="button" value="start" id="startloop">
					<input type="button" value="remove" id="removeloop">
				</div>
				`;
          })
          .join("");
      }
    }
    let isDisabled = false;

    isDisabled = localStorage.getItem("youtube_song_memorizer_settings");
    if (isDisabled !== null) {
      isDisabled = JSON.parse(isDisabled).disabled;
    }

    div.innerHTML = `
		<div id="youtube-song-memorizer" ${isDisabled ? 'style="display:none;"' : ""}>
			<div id="command-room">
				<button id="deactivate">deactivate</button>
				<button id="closethisarea">close this area</button>
				
				<a href="https://twitter.com/ouzkagann" target="_blank">reach me</a>
				<div class="x-times-container" style="padding-left:5px;">
					Jump next loop after <input type="number" name="loopcount" id="loopcount" placeholder="5"> times
				</div>
				
			</div>
			<hr>
		
			${existingLoop}
			<div class="add-new-loop-container">
				<button id="addloop">
					add new loop
				</button>
			</div>
		</div>
	`;

    document.querySelector("#related #items").prepend(div);

    // FUNCTIONS

    let addLoop = document.querySelector("#addloop");
    let startLoop = document.querySelectorAll("#startloop");
    let removeLoop = document.querySelector("#removeloop");
    let addLoopContainer = document.querySelector(".add-new-loop-container");
    let activeVideo = document.querySelector(
      "#movie_player > div.html5-video-container > video"
    );
    let loopCounts = document.querySelector("#loopcount");

    // ADD NEW LOOP
    addLoop.addEventListener("click",  () => {
      let loopContainersCount =
        document.querySelectorAll(".loop-container").length + 1;
      let newLoopContainer = document.createElement("div");
      newLoopContainer.className =
        "loop-container loop-container-" + loopContainersCount;
      newLoopContainer.dataset.number = loopContainersCount;

      newLoopContainer.innerHTML = `
    <input type="text" class="loop-start" placeholder="0:15">to <input type="text" class="loop-end" placeholder="0:30" >
    <input type="button" value="start" id="startloop">
    <input type="button" value="remove" id="removeloop">
  `;

      addLoopContainer.parentNode.insertBefore(
        newLoopContainer,
        addLoopContainer
      );
      setFunctionsForEvents();
    });

    // HELPERS
    function hmsToSecondsOnly(str) {
      var p = str.split(":"),
        s = 0,
        m = 1;

      while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
      }

      return s;
    }

    // START/REMOVE
    let loopRules = {
      loopNumber: 0,
      isExtensionActive: true,
      times: -1,
      oldTimes: -99,
      deactivated: false,
    };
    // track video
    let nextStartValue = "0:00";

    activeVideo.ontimeupdate = function (e) {
      if (loopRules.loopNumber == 0 || loopRules.deactivated == true) {
        return;
      }

      // if times = 0 jump to next loop
      if (loopRules.times === 1) {
        nextStartValue = "0:00";
      }
      if (loopRules.times === 0) {
        // WAIT UNTIL NEXT LOOP START COMES
        if (activeVideo.currentTime < hmsToSecondsOnly(nextStartValue)) {
          return;
        }
        if (nextStartValue !== "0:00") {
          // activeVideo.currentTime = hmsToSecondsOnly(nextStartValue);
          loopRules.times = loopRules.oldTimes;
          return;
        }

        let allLoopContainers = document.querySelectorAll(".loop-container");
        avaliableNumbers = [];
        for (let i = 0; i < allLoopContainers.length; i++) {
          avaliableNumbers.push(allLoopContainers[i].dataset.number);
        }
        letIndexOfNext = avaliableNumbers.indexOf(loopRules.loopNumber) + 1;
        if (letIndexOfNext < avaliableNumbers.length) {
          loopRules.loopNumber = avaliableNumbers[letIndexOfNext];
        } else {
          loopRules.loopNumber = avaliableNumbers[0];
        }

        let singleLoopContainer = document.querySelector(
          `.loop-container-${loopRules.loopNumber}`
        );

        nextStartValue = singleLoopContainer.querySelector(".loop-start").value;

        if (activeVideo.currentTime < hmsToSecondsOnly(nextStartValue)) {
          return;
        } else {
          activeVideo.currentTime = hmsToSecondsOnly(nextStartValue);
          loopRules.times = loopRules.oldTimes;
        }
      }

      // when loop rules not matter
      let singleLoopContainer = document.querySelector(
        `.loop-container-${loopRules.loopNumber}`
      );

      let startValue = singleLoopContainer.querySelector(".loop-start").value;
      let endValue = singleLoopContainer.querySelector(".loop-end").value;
      if (startValue == "" || endValue == "") {
        return;
      }
      // do not directly next loop

      if (activeVideo.currentTime > hmsToSecondsOnly(endValue)) {
        // decrement times until it's 0
        if (loopRules.times > 0) {
          loopRules.times = loopRules.times - 1;
        }
        activeVideo.currentTime = hmsToSecondsOnly(startValue);
      }
    };

    // start and remove functions
    function startLoopFunction(event) {
      loopRules.loopNumber = event.target.parentNode.dataset.number;
      // let singleLoopContainer = document.querySelector(`.loop-container-${event.target.dataset.number}`)
      let singleLoopContainer = event.target.parentNode;
      let startValue = singleLoopContainer.querySelector(".loop-start").value;
      let endValue = singleLoopContainer.querySelector(".loop-end").value;

      activeVideo.currentTime = hmsToSecondsOnly(startValue);
    }
    function removeLoopFunction(event) {
      // document.querySelector(`.loop-container-${event.target.dataset.number}`).remove()
      event.target.parentNode.remove();
    }
    function setFunctionsForEvents() {
      //  set starts
      let startLoops = document.querySelectorAll("#startloop");
      startLoops.forEach((loop) => {
        loop.addEventListener("click", startLoopFunction);
      });
      // set removes
      let removeLoops = document.querySelectorAll("#removeloop");
      removeLoops.forEach((loop) => {
        loop.addEventListener("click", removeLoopFunction);
      });
    }
    setFunctionsForEvents();

    // set loop seconds
    document.querySelector("#loopcount").addEventListener("input", function () {
      loopRules.times = parseInt(loopCounts.value);
      loopRules.oldTimes = parseInt(loopCounts.value);
    });
    document
      .querySelector("#deactivate")
      .addEventListener("click", function (e) {
        loopRules.isExtensionActive = !loopRules.isExtensionActive;
        e.target.innerText = loopRules.isExtensionActive
          ? "deactivate"
          : "activate";
        e.target.style.color = loopRules.isExtensionActive
          ? "var(--yt-spec-text-primary)"
          : "#ACD1AF";
        loopRules.deactivated = loopRules.isExtensionActive ? false : true;
        // let ne = document.createElement('span')
        // ne.innerHTML = loopRules.isExtensionActive ? "<span>activated</span>":"<span>deactivated</span>"
        // document.querySelector('.command-room').append(ne)
      });
    document
      .querySelector("#closethisarea")
      .addEventListener("click", function (e) {
        localStorage["youtube_song_memorizer_settings"] = JSON.stringify({
          disabled: true,
        });
        document.querySelector("#youtube-song-memorizer").style.display =
          "none";
      });

    document
      .querySelector("#youtube-song-memorizer")
      .addEventListener("focusout", function () {
        let loopContainers = document.querySelectorAll(".loop-container");
        const localId =
          "yt_song_memorizer" +
          window.location
            .toString()
            .replace("https://www.youtube.com/watch?v=", "");

        let loopData = [];
        for (let i = 0; i < loopContainers.length; i++) {
          loopData.push([
            loopContainers[i].querySelector(".loop-start").value,
            loopContainers[i].querySelector(".loop-end").value,
          ]);
        }

        let newLoopData = {};
        newLoopData[localId] = [...loopData];

        let exLocalData = localStorage.getItem("youtube_song_memorizer");
        if (exLocalData === null) {
          window.localStorage["youtube_song_memorizer"] = JSON.stringify({});
        } else {
          let parsedExLocalData = JSON.parse(exLocalData);

          let dataToSave = { ...parsedExLocalData, ...newLoopData };
          window.localStorage["youtube_song_memorizer"] =
            JSON.stringify(dataToSave);
        }
      });
  }, 2500);
};

init();



