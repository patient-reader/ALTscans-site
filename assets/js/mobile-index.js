const baseAPI = 'https://altscans-api.netlify.app/api';

const handleSeriesCover = (chapterNo) => {
    window.location.href = `/reader.html?chapter=${chapterNo}&series=${seriesName}&id=${mangaId}`;
};

class LatestReleases{constructor(){this.initializeComponents(),this.attachEventListeners()}initializeComponents(){this.starRatings=document.querySelectorAll(".star-rating"),this.likeButtons=document.querySelectorAll(".like-button"),this.coverUploads=document.querySelectorAll(".cover-upload"),this.chapterButtons=document.querySelectorAll(".chapter-btn, .chapter-btn-highlight")}attachEventListeners(){this.initializeStarRatings(),this.initializeLikeButtons(),this.initializeCoverUploads(),this.initializeChapterButtons()}initializeStarRatings(){this.starRatings.forEach(t=>{const e=t.querySelectorAll(".star");e.forEach((t,s)=>{t.addEventListener("click",()=>this.updateStarRating(e,s)),t.addEventListener("keypress",t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.updateStarRating(e,s))})})})}updateStarRating(t,e){t.forEach((t,s)=>{t.dataset.active=(s<=e).toString(),t.setAttribute("aria-pressed",(s<=e).toString())})}initializeLikeButtons(){this.likeButtons.forEach(t=>{t.addEventListener("click",()=>this.toggleLike(t)),t.addEventListener("keypress",e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this.toggleLike(t))})})}toggleLike(t){const e="true"===t.dataset.liked;t.dataset.liked=(!e).toString(),t.setAttribute("aria-pressed",(!e).toString()),t.innerHTML=e?"♡":"♥"}initializeCoverUploads(){this.coverUploads.forEach(t=>{t.querySelector("input[type=file]").addEventListener("change",e=>this.handleCoverUpload(e,t))})}handleCoverUpload(t,e){const s=t.target.files[0];if(s&&s.type.startsWith("image/")){const t=new FileReader;t.onload=t=>{e.style.backgroundImage=`url(${t.target.result})`,e.style.backgroundSize="cover",e.style.backgroundPosition="center";const s=e.querySelector(".cover-upload-icon");s&&(s.style.display="none")},t.readAsDataURL(s)}}initializeChapterButtons(){this.chapterButtons.forEach(t=>{t.addEventListener("click",()=>this.handleChapterSelection(t))})}handleChapterSelection(t){console.log(`Reading ${t.textContent}`)}}document.addEventListener("DOMContentLoaded",()=>{new LatestReleases});

function readChapter(manga, nick, chapterNo){
  window.location.href = `/reader?id=${manga}&series=${nick}&chapter=${chapterNo}`;
}

function setActiveFilter(element){
  document.querySelectorAll('.filter-option').forEach(btn=>btn.classList.remove('active'));
  element.classList.add('active');
}

window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

if (window.mobileAndTabletCheck() === false){

  console.log("Not a mobile device")
  document.head.appendChild(`<script data-cfasync="false" src="/sw.js"></script>`)
  document.head.appendChild(`<script src="https://kulroakonsu.net/88/tag.min.js" data-zone="137255" async data-cfasync="false"></script>`); 
};
