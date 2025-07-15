let currentSong = new Audio()
let songs;
let currfolder;





async function getsongs(folder) {
  currfolder = folder
  
  let a = await fetch(`/songs/`)


  let response = await a.text();
  // console.log(response)
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                               
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                               
                            </div> </li>`

  }



  function cardClickHandler(e) {
    const folderName = e.currentTarget.dataset.folder;
    if (!folderName) return;

    getsongs(`songs/${folderName}`).then(() => {
      if (songs.length > 0) {
        playMusic(songs[0], true);
      }
    });
  }
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      e.addEventListener("click", cardClickHandler);



    })
  })



}


function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
  

  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play()
    

  }
  

  document.querySelector(".songinfo").innerHTML = `${decodeURI(track)}`
  document.querySelector(".songtime").innerHTML = "00:00/00:00"
  document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

};
async function loadFolder(folderName) {
  currfolder = `songs/${folderName}`;
  const res = await fetch(`/${currfolder}/`);
  const html = await res.text();

  const container = document.createElement("div");
  container.innerHTML = html;

  const anchors = container.getElementsByTagName("a");
  songs = [];

  for (let anchor of anchors) {
    const pathParts = new URL(anchor.href).pathname.split("/");
    const trackName = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (trackName && trackName.endsWith(".mp3")) {
      songs.push(trackName);
    }
  }

  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>  
        <img class="invert" width="34" height="34" src="music.svg" alt="">
        <div class="info">
          <div>${song}</div>
          <div>${folderName}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          
        </div>
      </li>`;
  }
  document.querySelectorAll(".songList ul li").forEach((li, index) => {
    li.addEventListener("click", () => {
      if (songs[index]) {
        playMusic(songs[index]);
      } else {
        console.warn(" Track not found at index", index);
      }
    });
  });
}

document.querySelectorAll(".songList ul li").forEach((li, index) => {
  li.addEventListener("click", () => playMusic(songs[index]));
});

async function loadAllSongs() {
  const folders = ["bella", "emiway","Gaush","king","Apdhillon","subh"]; 
  songs = [];
  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const folder of folders) {
    const res = await fetch(`/songs/${folder}/`);
    const html = await res.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const anchors = tempDiv.getElementsByTagName("a");

    for (let anchor of anchors) {
      const pathParts = new URL(anchor.href).pathname.split("/");
      const trackName = decodeURIComponent(pathParts[pathParts.length - 1]);
      if (trackName && trackName.endsWith(".mp3")) {
        songs.push({ track: trackName, folder });
        songUL.innerHTML += `
          <li>
            <img class="invert" width="34" src="music.svg" alt="">
            <div class="info">
              <div>${trackName}</div>
              <div>${folder.charAt(0).toUpperCase() + folder.slice(1)}</div>
            </div>
            <div class="playnow">
              <span>Play Now</span>
              
            </div>
          </li>`;
      }
    }
  }

  // Attach click handlers to play from correct folder
  document.querySelectorAll(".songList ul li").forEach((li, index) => {
    li.addEventListener("click", () => {
      const { track, folder } = songs[index];
      currfolder = `songs/${folder}`;
      playMusic(track);
    });
  });
}



async function main() {
  
  document.querySelector(".reload").addEventListener("click", (e) => {
    loadAllSongs()
  })



  document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"



  await getsongs("songs")





  if (songs.length > 0) {
    
    setTimeout(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    }, 50);
   
  } else {
    console.warn( folderName);
  }






  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
     
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })


  })



  play.addEventListener("click", () => {
    
    if (currentSong.paused) {
      currentSong.play()
      play.src = "pause.svg"
    }
    else {
      currentSong.pause()
      play.src = "play.svg"
    }
  })





  document.querySelector(".bella").addEventListener("click", () => {
    loadFolder("bella").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });




  document.querySelector(".emiway").addEventListener("click", () => {
    loadFolder("emiway").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });

  document.querySelector(".Apdhillon").addEventListener("click", () => {
    loadFolder("Apdhillon").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
  document.querySelector(".Gaush").addEventListener("click", () => {
    loadFolder("Gaush").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });  document.querySelector(".king").addEventListener("click", () => {
    loadFolder("king").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });  document.querySelector(".subh").addEventListener("click", () => {
    loadFolder("subh").then(() => {
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });


  
  document.querySelectorAll(".songList ul li").forEach(li => {
    const track = li.querySelector(".info > div").textContent.trim();
    li.addEventListener("click", () => playMusic(track));

  });



  currentSong.addEventListener("timeupdate", (e) => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`
    
    const circle = document.querySelector(".circle");
    const playedProgressElement = document.querySelector(".played-progress");
    if (circle && !isNaN(currentSong.duration)) {
      const progress = (currentSong.currentTime / currentSong.duration) * 100;
      circle.style.left = `${progress}%`;
    }

    if (playedProgressElement && !isNaN(currentSong.duration)) {
      const progreses = (currentSong.currentTime / currentSong.duration) * 100;
      playedProgressElement.style.width = `${progreses}%`;
    }



  });

  let isDragging = false;

  const seekbar = document.querySelector(".seekbar");
  const circle = document.querySelector(".circle");
  const playedProgressElement = document.querySelector(".played-progress");

  circle.addEventListener("mousedown", () => {
    isDragging = true;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const seekbarRect = seekbar.getBoundingClientRect();
      let offsetX = e.clientX - seekbarRect.left;
      offsetX = Math.max(0, Math.min(offsetX, seekbarRect.width));
      const percent = (offsetX / seekbarRect.width) * 100;

      circle.style.left = `${percent}%`;
      playedProgressElement.style.width = `${percent}%`;

      if (!isNaN(currentSong.duration)) {
        currentSong.currentTime = (percent / 100) * currentSong.duration;
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });


  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })
  previous.addEventListener("click", () => {
    console.log('hello');
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index + 1])
    }
  })
  next.addEventListener("click", () => {


    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  })

  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

  });


  currentSong.addEventListener("ended", () => {
  let currentSrc = decodeURIComponent(currentSong.src.split("/").pop());
  
  let currentIndex = songs.findIndex(song =>
    typeof song === "string"
      ? song === currentSrc
      : song.track === currentSrc
  );

  let nextIndex = currentIndex + 1;

  if (songs[nextIndex]) {
    // Play the next track
    if (typeof songs[nextIndex] === "string") {
      playMusic(songs[nextIndex]);
    } else {
      currfolder = `songs/${songs[nextIndex].folder}`;
      playMusic(songs[nextIndex].track);
    }
  } else {
    // Replay current track if next doesn't exist
    if (typeof songs[currentIndex] === "string") {
      playMusic(songs[currentIndex]);
    } else {
      currfolder = `songs/${songs[currentIndex].folder}`;
      playMusic(songs[currentIndex].track);
    }
  }
});
}

main() 