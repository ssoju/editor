// import { post, put } from '@hornet-editor/fetch';

let index = 1; // XXX: 히스토리 아이디가 굳이 필요하지 않다면 지워도 됩니다.

function create(/*docId, entry*/) {
  // 새 히스토리 시작
  // return post.json(`/document/${docId}/history`, { entry });

  // 서버측 응답 샘플
  const responseSample = {
    result: 'ok',
    entryId: index++, // XXX: 아이디가 굳이 필요하지 않다면 지워도 됩니다.
  };

  return Promise.resolve(responseSample);
}

function end(/*docId, entry*/) {
  // 히스토리 끝 - 생성과 같은 주소지만 요청 방식으로 구분
  // return put.json(`/document/${docId}/history`, { entry });

  // 서버측 응답 샘플
  const responseSample = {
    result: 'ok',
  };

  return Promise.resolve(responseSample);
}

export default {
  create,
  end,
};
