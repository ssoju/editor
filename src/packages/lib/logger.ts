/**
 * 서버쪽에 로그를 남김
 * 단, 에디터 개발 환경에서는 남기지 않는다.
 */
function realFactory(modulePath: string) {
  const isProd = /collabee\.co$/.test(window?.location?.hostname);
  const data = {
    type: 'editor',
    runningType: isProd ? 'live' : 'dev',
  };

  return (logData: { [key: string]: unknown } = {}) => {
    fetch('https://api-v2.openur.biz/logging/front', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        path: window.location?.href,
        logData: { ...logData, modulePath },
      }),
    });
  };
}

function emptyFactory() {
  return () => {};
}

// @ts-ignore
const factory = import.meta.env.MODE === 'development' ? emptyFactory : realFactory;

export default factory;
