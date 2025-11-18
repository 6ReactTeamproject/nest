/**
 * 이미지 크롭 유틸리티 함수
 * 주어진 이미지 소스와 자르기 영역 정보를 바탕으로 잘린 이미지를 생성하여 반환합니다.
 * 
 * 왜 필요한가?
 * - 이미지 크롭: 사용자가 선택한 영역만 잘라서 새로운 이미지 생성
 * - Canvas API 사용: 브라우저에서 이미지를 프로그래밍 방식으로 처리
 * - base64 변환: 크롭된 이미지를 base64 문자열로 변환하여 저장/전송 가능하게 함
 * - 비동기 처리: 이미지 로딩이 완료된 후에만 크롭 수행
 * 
 * @param {string} imageSrc - 원본 이미지 소스 (base64 또는 URL)
 * @param {Object} cropAreaPixels - 크롭 영역의 픽셀 좌표 (x, y, width, height)
 * @returns {Promise<string>} 크롭된 이미지의 base64 문자열
 */
export default function getCroppedImg(imageSrc, cropAreaPixels) {
  // Promise 반환: 이미지 로딩이 비동기 작업이므로
  return new Promise((resolve) => {
    // 새로운 이미지 객체 생성
    // 왜 Image 객체를 사용하나? 브라우저에서 이미지를 로드하고 처리하기 위해
    const image = new Image();
    // base64 또는 URL을 소스로 설정
    image.src = imageSrc;

    // 이미지 로딩이 완료되면 실행
    // 왜 onload를 사용하나? 이미지가 완전히 로드된 후에만 크롭할 수 있으므로
    image.onload = () => {
      // 이미지를 그릴 캔버스 생성
      // 왜 Canvas를 사용하나? 브라우저에서 이미지를 프로그래밍 방식으로 조작하기 위해
      const canvas = document.createElement("canvas");
      // 캔버스 크기를 잘라낼 영역으로 설정
      // 왜 이 크기인가? 크롭된 이미지의 크기와 동일하게 설정
      canvas.width = cropAreaPixels.width;
      canvas.height = cropAreaPixels.height;
      // 2D 그리기 컨텍스트 가져오기
      // 왜 2D인가? 이미지는 2D이므로 2D 컨텍스트 사용
      const ctx = canvas.getContext("2d");

      // 자르기 영역을 기준으로 이미지를 캔버스에 그림
      // drawImage: 원본 이미지의 특정 영역을 캔버스에 그리는 메서드
      // 왜 이렇게 하나? 원본 이미지에서 선택한 영역만 추출하여 새 이미지 생성
      ctx.drawImage(
        image,                          // 원본 이미지 객체
        cropAreaPixels.x,               // 원본 이미지에서 잘라낼 x 시작 위치
        cropAreaPixels.y,               // 원본 이미지에서 잘라낼 y 시작 위치
        cropAreaPixels.width,           // 잘라낼 너비
        cropAreaPixels.height,          // 잘라낼 높이
        0,                              // 캔버스의 x 시작 위치 (항상 0)
        0,                              // 캔버스의 y 시작 위치 (항상 0)
        cropAreaPixels.width,           // 캔버스에 그릴 너비
        cropAreaPixels.height           // 캔버스에 그릴 높이
      );

      // 캔버스에 그려진 이미지를 base64 문자열로 변환하여 반환
      // toDataURL: Canvas의 내용을 base64 데이터 URL로 변환
      // "image/jpeg": JPEG 형식으로 변환 (파일 크기 최적화)
      // 왜 base64인가? 문자열로 변환하여 저장하거나 서버로 전송할 수 있게 함
      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
}