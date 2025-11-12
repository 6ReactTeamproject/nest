// 주어진 이미지 소스와 자르기 영역 정보를 바탕으로 잘린 이미지를 생성하여 반환하는 함수
export default function getCroppedImg(imageSrc, cropAreaPixels) {
  return new Promise((resolve) => {
    const image = new Image();          // 새로운 이미지 객체 생성
    image.src = imageSrc;               // base64 또는 URL을 소스로 설정

    // 이미지 로딩이 완료되면 실행
    image.onload = () => {
      const canvas = document.createElement("canvas");         // 이미지를 그릴 캔버스 생성
      canvas.width = cropAreaPixels.width;                     // 캔버스 크기를 잘라낼 영역으로 설정
      canvas.height = cropAreaPixels.height;
      const ctx = canvas.getContext("2d");                     // 2D 그리기 컨텍스트 가져오기

      // 자르기 영역을 기준으로 이미지를 캔버스에 그림
      ctx.drawImage(
        image,
        cropAreaPixels.x,             // 원본 이미지에서 잘라낼 x 시작 위치
        cropAreaPixels.y,             // 원본 이미지에서 잘라낼 y 시작 위치
        cropAreaPixels.width,         // 잘라낼 너비
        cropAreaPixels.height,        // 잘라낼 높이
        0,                            // 캔버스의 x 시작 위치
        0,                            // 캔버스의 y 시작 위치
        cropAreaPixels.width,         // 캔버스에 그릴 너비
        cropAreaPixels.height         // 캔버스에 그릴 높이
      );

      // 캔버스에 그려진 이미지를 base64 문자열로 변환하여 반환
      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
}