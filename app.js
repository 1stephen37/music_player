const $ = document.querySelector.bind(document);

const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'music_player';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    isRepeat: false,
    songs: [
        {
            name: 'đi về nhà',
            singer: 'Đen Vâu & JustaTee',
            path: "assets/music/divenha.mp3",
            image: "assets/img/divenha.jpg"
        },
        {
            name: 'khúc Ca Vàng',
            singer: 'Mikelodic',
            path: "assets/music/khuccavang.mp3",
            image: "assets/img/khuccavang.webp"
        },
        {
            name: 'thu cuối',
            singer: 'Mr.T x Yanbi x Hằng BingBoong',
            path: "assets/music/thucuoi.mp3",
            image: "assets/img/thucuoi.webp"
        },
        {
            name: 'Don\'t Côi',
            singer: 'RPT Orijinn x Ronboogz',
            path: "assets/music/dontcoi.mp3",
            image: "assets/img/dontcoi.webp"
        },
        {
            name: 'Thuyền Quyên',
            singer: 'Diệu Kiên x CaoTri',
            path: "assets/music/thuyenquyen.mp3",
            image: "assets/img/thuyenquyen.webp"
        },
        {
            name: '26XX',
            singer: 'Pjnboys x Huỳnh James',
            path: "assets/music/26xx.mp3",
            image: "assets/img/26xx.webp"
        },
        {
            name: 'Tướng Quân',
            singer: 'Nhật Phong',
            path: "assets/music/tuongquan.mp3",
            image: "assets/img/tuongquan.webp"
        },
        {
            name: 'Đế Vương',
            singer: 'ĐÌNH DŨNG',
            path: "assets/music/devuong.mp3",
            image: "assets/img/devuong.webp"
        },
        {
            name: 'Nơi này có anh',
            singer: 'Sơn Tùng M-TP',
            path: "assets/music/noinaycoanh.mp3",
            image: "assets/img/noinaycoanh.webp"
        },
        {
            name: 'Yêu Anh Em Nhé',
            singer: 'singer',
            path: "assets/music/yeuanhemnhe.mp3",
            image: "assets/img/yeuanhemnhe.webp"
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map( (song,index) => {
            return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
            `;
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        let isSeeking = false; // Biến để theo dõi trạng thái đang tua nhạc
        let debounceTimeout;

        const cdThumbAnimate = cdThumb.animate([{transform: 'rotate(360deg)'}], {
            duration: 10000,
            iterations: Infinity
        });

        cdThumbAnimate.pause();

        document.onscroll = function() {
            document.onscroll = function() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop ;
                const newCdWidth = cdWidth - scrollTop;
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                cd.style.opacity = `${newCdWidth / cdWidth}`;
            }
        }

        playBtn.onclick = function () {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        audio.ontimeupdate = function () {
            if (!isSeeking) {
                if (audio.duration) {
                    progress.value = Math.floor(
                        (audio.currentTime / audio.duration) * 100
                    );
                }
            }
        };

        progress.oninput = function (e) {
            isSeeking = true; // Đánh dấu rằng đang tua nhạc

            audio.currentTime = (audio.duration / 100) * e.target.value;

            clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(function () {
                isSeeking = false; // Đánh dấu rằng đã kết thúc tua nhạc
            }, 50); // Thời gian chờ 200ms (có thể điều chỉnh theo ý muốn)
        };

        progress.onchange = function (e) {
            audio.currentTime = (audio.duration / 100) * e.target.value;
        };

        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        }

        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        }

        playList.onclick = function(e) {
            const songElement = e.target.closest('.song:not(.active)');
            if(songElement || e.target.closest('.option')) {
                if(songElement) {
                    _this.currentIndex = Number(songElement.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }

    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;

    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length)  {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0)  {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do{
          newIndex = Math.floor(Math.random() * this.songs.length);
        } while(this.currentIndex === newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
          setTimeout(() => {
              $('.song.active').scrollIntoView({
                  behavior: 'smooth',
                  block: this.currentIndex < 3 ? 'center' : 'nearest'
              })
          }, 300);
    },
    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.handleEvent();
        this.loadCurrentSong();
        this.render();

        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
}

app.start();


