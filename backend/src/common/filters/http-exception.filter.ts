/**
 * HTTP 예외 필터
 * 애플리케이션에서 발생하는 모든 예외를 일관된 형식으로 처리합니다.
 * 
 * 왜 필요한가?
 * - 일관된 에러 응답: 모든 에러를 동일한 형식으로 반환하여 API 일관성 유지
 * - 사용자 친화적 메시지: 에러를 사용자가 이해하기 쉬운 형식으로 변환
 * - 디버깅 정보: 에러 발생 시간, 경로 등 디버깅에 유용한 정보 포함
 * - 전역 처리: 모든 컨트롤러에서 발생하는 예외를 한 곳에서 처리
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(): 모든 예외를 잡아서 처리
// 왜 빈 배열인가? 모든 예외 타입을 처리하기 위해
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 예외 처리 메서드
   * 발생한 예외를 일관된 형식으로 변환하여 응답합니다.
   * 
   * 왜 필요한가?
   * - 예외 변환: 다양한 예외 타입을 일관된 형식으로 변환
   * - 상태 코드 결정: 예외 타입에 따라 적절한 HTTP 상태 코드 설정
   * - 메시지 추출: 예외에서 사용자에게 보여줄 메시지 추출
   * 
   * @param exception 발생한 예외 (HttpException 또는 기타 예외)
   * @param host 실행 컨텍스트 (HTTP 요청/응답 객체 접근용)
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP 상태 코드 결정
    // HttpException인 경우: 예외에서 상태 코드 가져오기
    // 그 외의 경우: 500 Internal Server Error
    // 왜 이렇게 하나? 예상된 예외와 예상치 못한 예외를 구분하여 처리
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 에러 메시지 추출
    // HttpException인 경우: 예외에서 메시지 가져오기
    // 그 외의 경우: 기본 메시지 사용
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 메시지를 문자열로 변환
    // 왜 이렇게 하나? 예외 메시지가 객체일 수도 있고 문자열일 수도 있으므로
    const errorMessage = typeof message === 'string' 
      ? message 
      : (typeof message === 'object' && message !== null && 'message' in message)
        ? (message as { message: string | string[] }).message
        : 'Internal server error';

    // 일관된 에러 응답 형식
    // 왜 이 형식인가? API 일관성을 유지하고 디버깅을 쉽게 하기 위해
    const errorResponse = {
      statusCode: status, // HTTP 상태 코드
      timestamp: new Date().toISOString(), // 에러 발생 시간
      path: request.url, // 에러가 발생한 경로
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage, // 에러 메시지 (배열이면 첫 번째 요소)
    };

    // JSON 형식으로 에러 응답 반환
    response.status(status).json(errorResponse);
  }
}

