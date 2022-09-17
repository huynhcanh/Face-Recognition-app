/*
    Hiện nay, công nghệ AI có 3 hướng chính:
        Xử lý hình ảnh (Computer Vision) => my project
        Xử lý ngôn ngữ tự nhiên (Natural Language Processing)
        Xử lý tín hiệu âm thanh (Audio Signal Processing)
    ứng dụng của AI trong đời sống:
        1. Hệ thống nhận diện khuôn mặt thông qua các camera được gắn tại sân bay và các tòa nhà
        2. Các trợ lý ảo (như Siri, Google Assistant, Alexa) có khả năng nghe, hiểu, trả lời và
        làm việc cho mình
        3. Những ứng dụng trong y sinh, dùng AI để chẩn đoán bệnh dựa trên phim chụp X-quang,
        X-ray và MRI
        4. Quen thuộc hơn thì có những dòng smart TV, áp dụng công nghệ AI để cải tiến chất
        lượng hình ảnh hoặc nhận diện giọng nói…
Chúng ta ứng dụng trí tuệ nhân tạo vào trang web thông qua thư viện face-api.min.js
Khi sử dụng thư viện AI nó sẽ kèm theo những model (mô hình tính toán đã được huấn luyện sẵn
    bằng những tập dữ liệu của gương mặt, chữ viết giọng nói, ...) => chúng ta có thể làm các
    tác vụ thông minh cho máy tính
*/

// Tham chiếu biến "video" đến id có tên "videoElm"
const video = document.getElementById("videoElm");

// Truyền các model vào face-api.js
const loadFaceAPI = async() =>{
    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");// model dùng để hiển thị được các điểm xung quanh mặt của mình
    await faceapi.nets.faceRecognitionNet.loadFromUri("./models");// model dùng để nhận dạng gương mặt
    await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
    await faceapi.nets.faceExpressionNet.loadFromUri("./models");// model dùng để dự đoán các biểu cảm khuôn mặt
}

// Sử dụng web API để yêu cầu người dùng cho phép chúng ta có thể lấy được dữ liệu từ webcam
function getCameraStream(){
    if(navigator.mediaDevices.getUserMedia)// Check navigator: Nếu trình duyệt có hỗ trợ
    {
        // đọc dữ liệu trả về từ API:
        navigator.mediaDevices.getUserMedia({ video:{} })// method getUserMedia yêu cầu người dùng cho phép đọc dữ liệu
            .then(stream =>{video.srcObject = stream;/*Sử dụng dữ liệu stream add vào trong video*/} );// lấy ra dữ liệu trả về từ API
     }
}

/*nguyên lý lúc này là: ở mỗi thời điểm playing video thì nó liên tục tạo ra canvas lúc đó.
Lúc này ta sẽ đè phần tử canvas đó đè lên phần tử video*/

// Thêm event vào thẻ video khi đang playing
video.addEventListener("playing",()=>{
    // tạo phần tử canvas từ video
    const canvas = faceapi.createCanvasFromMedia(video);
    // add canvas vào body
    document.body.append(canvas);
    // size video
    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    }
    //method chạy lại sau 0.3s
    setInterval(async ()=>{
        // lấy dữ liệu trả về từ API
        const detects = await faceapi.detectAllFaces(video, new 
            faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        //thay đổi size của detects mà API trả về = size của video truyền dữ liệu vào
        const resizedDetects = faceapi.resizeResults(detects,displaySize);
        //clear canvas trước khi draw
        canvas.getContext("2d").clearRect(0,0, displaySize.width, displaySize.height);
        // vẽ khung nhận dạng khuôn mặt và chỉ số chính xác
        faceapi.draw.drawDetections(canvas, resizedDetects);
        // vẽ các điểm quanh mặt
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetects);
        // dự đoán biểu cảm khuôn mặt
        faceapi.draw.drawFaceExpressions(canvas, resizedDetects);
    },300);
});
loadFaceAPI().then(getCameraStream);