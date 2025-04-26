import React, { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [isCameraAccessGranted, setIsCameraAccessGranted] = useState<boolean>(false);

  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        // 먼저 카메라 접근 권한을 요청
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setCameraError('사용 가능한 카메라가 없습니다.');
          return;
        }
        
        setAvailableCameras(videoDevices);
        setSelectedCamera(videoDevices[0].deviceId);
        setIsCameraAccessGranted(true);
      } catch (error) {
        console.error('카메라 접근 오류:', error);
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setCameraError('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
          } else if (error.name === 'NotFoundError') {
            setCameraError('사용 가능한 카메라를 찾을 수 없습니다.');
          } else {
            setCameraError('카메라 접근 중 오류가 발생했습니다.');
          }
        } else {
          setCameraError('알 수 없는 오류가 발생했습니다.');
        }
        setIsCameraAccessGranted(false);
      }
    };

    getAvailableCameras();
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      if (!selectedCamera) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraAccessGranted(true);
          setCameraError('');
        }
      } catch (err) {
        console.error('웹캠 접근 오류:', err);
        setCameraError('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
        setIsCameraAccessGranted(false);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(event.target.value);
  };

  const captureImage = async () => {
    if (!isCameraAccessGranted) {
      setCameraError('카메라 접근이 필요합니다.');
      return;
    }

    try {
      // 전체 페이지를 캡처
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1
      });
      
      // PNG 형식으로 이미지 데이터 추출
      const imageData = canvas.toDataURL('image/png');
      
      // 다운로드 링크 생성 및 클릭
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `독도의용수비대_캡처_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('캡처 중 오류 발생:', error);
      setCameraError('이미지 캡처 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="text-center py-2 relative">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-300 pb-1 mb-2">
            <span className="text-xs text-gray-600 mb-2 sm:mb-0">Busan IL Science High School</span>
            <div className="flex items-center gap-2">
              {availableCameras.length > 0 && (
                <select 
                  onChange={handleCameraChange}
                  value={selectedCamera}
                  className="text-xs border rounded px-2 py-1"
                >
                  {availableCameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `카메라 ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              )}
              <button 
                onClick={captureImage}
                className="rounded-full text-xs bg-blue-600 text-white px-3 py-1 hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                SAVE
              </button>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tighter"></h1>
        </div>
        {/* Top News Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 border-b border-gray-300 pb-4">
          <div className="flex items-center">
            <div className="w-24 h-16 overflow-hidden mr-2">
              <img
                src="https://readdy.ai/api/search-image?query=Traditional%20Korean%20historical%20figure%20in%20traditional%20clothing%2C%20detailed%20portrait%20with%20neutral%20background%2C%20high%20quality%20photorealistic%20image%20with%20dramatic%20lighting&width=100&height=64&seq=1&orientation=landscape"
                alt="Art News"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="text-red-700 text-sm font-semibold">역사 특집</h3>
              <p className="text-sm font-bold">조선의 영웅들: 역사 속 독도 수호자들</p>
              <div className="text-xs text-gray-600">페이지 26 | 문화</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-24 h-16 overflow-hidden mr-2">
              <img
                src="https://readdy.ai/api/search-image?query=Beautiful%20landscape%20of%20Dokdo%20island%20in%20Korea%20with%20dramatic%20sunrise%2C%20clear%20blue%20ocean%20surrounding%20rocky%20islands%2C%20natural%20beauty%20of%20Korean%20territory&width=100&height=64&seq=2&orientation=landscape"
                alt="Climate News"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="text-red-700 text-sm font-semibold">환경 보존</h3>
              <p className="text-sm font-bold">독도 생태계: 보존과 연구의 중요성</p>
              <div className="text-xs text-gray-600">페이지 18 | 환경</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-24 h-16 overflow-hidden mr-2">
              <img
                src="https://readdy.ai/api/search-image?query=Modern%20Korean%20naval%20ships%20patrolling%20waters%20near%20Dokdo%20island%2C%20professional%20military%20photograph%20with%20blue%20ocean%20and%20clear%20sky%2C%20showing%20Korean%20sovereignty&width=100&height=64&seq=3&orientation=landscape"
                alt="Defense News"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="text-red-700 text-sm font-semibold">국방 소식</h3>
              <p className="text-sm font-bold">독도 수호: 해양 경비대의 임무와 도전</p>
              <div className="text-xs text-gray-600">페이지 21 | 국방</div>
            </div>
          </div>
        </div>
      </div>
      {/* Newspaper Title */}
      <div className="container mx-auto text-center py-4 sm:py-6 border-b border-gray-300">
        <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tighter">독도 신문</h1>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-300 pb-6 lg:pb-0 lg:pr-6">
          <h2 className="text-2xl font-bold mb-4 font-serif">독도의용수비대 신규 단원</h2>
          <div className="mb-4">
            <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
              {!isCameraAccessGranted ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4 text-center">
                  {cameraError || '카메라 접근 권한이 필요합니다.'}
                  <br />
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-400 hover:text-blue-300"
                  >
                    권한 재요청
                  </button>
                </div>
              ) : null}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-2 right-2 bg-red-600 w-3 h-3 rounded-full animate-pulse"></div>
              <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">LIVE</div>
            </div>
            <p className="text-sm text-gray-600 italic">독도의용수비대 실시간 모니터링</p>
          </div>
          <div>
            <p className="text-base mb-3">
              독도의용수비대는 1954년 설립된 이래로 독도를 수호하는 민간 조직으로서 중요한 역할을 해왔습니다. 현재 신규 단원들과 함께 24시간 독도를 지키고 있습니다.
            </p>
            <p className="text-base mb-3">
              의용수비대원들은 독도에 상주하며 기상 관측, 영토 감시, 환경 보호 등 다양한 임무를 수행하고 있습니다. 특히 최근에는 첨단 장비를 도입하여 감시 능력을 한층 강화했습니다.
            </p>
            <p className="text-base">
              우리의 영토를 지키기 위해 헌신하는 독도의용수비대원들의 노고에 감사드립니다. 이들의 활동은 독도가 대한민국의 영토임을 실질적으로 입증하는 중요한 증거가 되고 있습니다.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="text-xl font-bold mb-2 font-serif">독도의용수비대 활동 소식</h3>
            <p className="text-base mb-4">
              독도의용수비대는 최근 해양 오염 감시와 불법 어로 활동 감시를 위한 새로운 시스템을 도입했습니다. 이를 통해 독도 주변 해역의 안전과 환경 보호가 한층 강화될 것으로 기대됩니다.
            </p>
            <div className="mb-6">
              <img
                src="https://readdy.ai/api/search-image?query=Modern%20coast%20guard%20patrol%20members%20monitoring%20ocean%20waters%20with%20advanced%20surveillance%20equipment%2C%20professional%20maritime%20security%20operations%20with%20high%20tech%20equipment%20in%20control%20room&width=400&height=250&seq=8&orientation=landscape"
                alt="Coast Guard Monitoring"
                className="w-full h-48 object-cover object-top mb-2"
              />
              <p className="text-sm text-gray-600 italic">첨단 감시 시스템을 운용 중인 의용수비대원들</p>
            </div>
          </div>
        </div>
        {/* Middle Column */}
        <div className="px-0 sm:px-4">
          <div className="mb-6">
            <img
              src="https://readdy.ai/api/search-image?query=Beautiful%20aerial%20view%20of%20Dokdo%20island%20in%20Korea%2C%20showing%20the%20rocky%20islands%20surrounded%20by%20clear%20blue%20ocean%2C%20natural%20beauty%20with%20dramatic%20clouds%20and%20sunlight%2C%20high%20resolution%20photograph&width=400&height=300&seq=5&orientation=landscape"
              alt="Dokdo Island"
              className="w-full h-64 object-cover object-top"
            />
            <p className="text-sm text-gray-600 italic text-center mt-2">아름다운 독도의 전경, 대한민국의 동쪽 끝 영토</p>
          </div>
          <h2 className="text-3xl font-bold mb-4 font-serif text-center">독도, 한국의 영원한 영토</h2>
          <div className="text-lg leading-relaxed">
            <p className="mb-4">
              독도는 대한민국 경상북도 울릉군에 속하는 대한민국의 가장 동쪽에 위치한 섬입니다. 동도와 서도를 중심으로 89개의 부속도서로 이루어져 있으며, 총면적은 약 187,554m²입니다.
            </p>
            <p className="mb-4">
              독도는 풍부한 해양 자원과 독특한 생태계를 보유하고 있어 학술적으로도 매우 중요한 가치를 지니고 있습니다. 또한 전략적으로도 중요한 위치에 있어 동해의 평화를 지키는 중요한 역할을 하고 있습니다.
            </p>
            <p>
              현재 독도에는 독도 경비대원들이 상주하며 우리 영토를 지키고 있으며, 매년 수많은 국민들이 독도를 방문하여 우리 영토에 대한 사랑과 관심을 표현하고 있습니다.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="text-xl font-bold mb-2 font-serif">독도 관광 활성화 방안</h3>
            <p className="text-base">
              독도 관광을 활성화하기 위한 새로운 방안이 논의되고 있습니다. 기상 조건이 좋은 날에만 제한적으로 이루어지던 독도 방문을 더욱 안정적으로 운영하기 위한 인프라 구축이 계획 중입니다.
            </p>
          </div>
        </div>
        {/* Right Column */}
        <div className="border-t lg:border-t-0 lg:border-l border-gray-300 pt-6 lg:pt-0 lg:pl-6">
          <h2 className="text-2xl font-bold mb-4 font-serif">독도 관련 최신 소식</h2>
          <div className="mb-6 pb-6 border-b border-gray-300">
            <h3 className="text-xl font-bold mb-2">독도 해양 생태계 보존 활동 확대</h3>
            <div className="mb-2">
              <img
                src="https://readdy.ai/api/search-image?query=Marine%20biologists%20researching%20unique%20ecosystem%20around%20Dokdo%20island%2C%20scientists%20collecting%20samples%20of%20rare%20marine%20species%2C%20underwater%20photography%20with%20clear%20visibility&width=300&height=200&seq=6&orientation=landscape"
                alt="Marine Research"
                className="w-full h-40 object-cover object-top"
              />
            </div>
            <p className="text-base">
              독도 주변 해역의 독특한 해양 생태계를 보존하기 위한 연구 활동이 확대되고 있습니다. 특히 기후 변화로 인한 해양 환경 변화가 독도 생태계에 미치는 영향에 대한 연구가 집중적으로 이루어지고 있습니다.
            </p>
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-blue-800">주요 연구 분야</h4>
              <ul className="text-sm text-blue-700 list-disc pl-4 mt-2">
                <li>해양 생물 다양성 조사</li>
                <li>수중 생태계 모니터링</li>
                <li>해양 오염도 측정</li>
                <li>기후변화 영향 분석</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">독도 디지털 아카이브 구축</h3>
            <div className="mb-2">
              <img
                src="https://readdy.ai/api/search-image?query=Modern%20digital%20archive%20system%20with%20large%20screens%20displaying%20historical%20documents%20and%20maps%20about%20Dokdo%20island%2C%20high%20tech%20research%20facility%20with%20researchers%20working&width=300&height=200&seq=10&orientation=landscape"
                alt="Digital Archive"
                className="w-full h-40 object-cover object-top"
              />
            </div>
            <p className="text-base mb-4">
              독도 관련 역사적 자료와 연구 결과를 디지털화하여 보존하는 '독도 디지털 아카이브' 프로젝트가 시작되었습니다. 이를 통해 독도의 역사적, 지리적, 생태적 가치를 더욱 체계적으로 연구하고 보존할 수 있을 것으로 기대됩니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-bold">디지털 아카이브 주요 콘텐츠</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="bg-white p-2 rounded">
                  <i className="fas fa-map-marked-alt text-blue-600"></i>
                  <span className="ml-2">고지도 컬렉션</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <i className="fas fa-book-open text-blue-600"></i>
                  <span className="ml-2">역사 문헌</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <i className="fas fa-camera text-blue-600"></i>
                  <span className="ml-2">사진 아카이브</span>
                </div>
                <div className="bg-white p-2 rounded">
                  <i className="fas fa-chart-line text-blue-600"></i>
                  <span className="ml-2">연구 데이터</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 border-t border-gray-300 mt-4 sm:mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-serif text-center">조선의 영웅 안용복</h2>
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/3 sm:pr-6 mb-4 sm:mb-0">
            <img
              src="https://readdy.ai/api/search-image?query=Historical%20Korean%20figure%20An%20Yong-bok%20in%20traditional%20Joseon%20dynasty%20clothing%2C%20standing%20proudly%20with%20documents%2C%20artistic%20portrait%20in%20traditional%20Korean%20painting%20style%20with%20neutral%20background&width=300&height=400&seq=7&orientation=portrait"
              alt="An Yong-bok"
              className="w-full h-80 object-cover object-top"
            />
            <p className="text-sm text-gray-600 italic text-center mt-2">안용복 - 독도를 지킨 조선의 영웅</p>
          </div>
          <div className="w-full sm:w-2/3">
            <p className="text-lg mb-4">
              안용복(1663~1714)은 조선 후기의 어부이자 독도(당시 울릉도와 우산도로 불림)의 영유권을 지키기 위해 일본에 두 차례나 건너가 항의한 인물입니다. 그의 용기 있는 행동은 오늘날까지 독도가 한국 영토로 남을 수 있게 한 중요한 역사적 사건입니다.
            </p>
            <p className="text-lg mb-4">
              1693년, 안용복은 울릉도에서 조업 중 일본 어민들과 충돌한 후 납치되어 일본으로 끌려갔습니다. 그곳에서 그는 울릉도와 독도가 조선의 영토임을 당당히 주장했습니다. 이후 1696년에는 자발적으로 일본에 건너가 조선 정부의 사신이라고 자처하며 다시 한번 독도의 영유권을 주장했습니다.
            </p>
            <p className="text-lg mb-4">
              안용복의 이러한 행동은 일본 정부가 울릉도와 독도에 대한 조선의 영유권을 인정하게 만드는 계기가 되었습니다. 1696년 일본 막부는 울릉도 도해금지령을 내렸고, 이는 사실상 독도가 조선의 영토임을 인정한 것이었습니다.
            </p>
            <p className="text-lg">
              비록 조선 정부로부터 공식 사신의 자격을 부여받지 않았지만, 안용복의 용기 있는 행동은 독도의 역사에서 매우 중요한 의미를 가집니다. 그는 개인의 신분으로 나라의 영토를 지키기 위해 목숨을 걸고 싸운 진정한 애국자였습니다.
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 border-t border-gray-300 mt-4 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
        <p>© 2025 독도 신문 | 모든 권리 보유 | 발행일: 2025년 4월 26일 토요일</p>
      </footer>
    </div>
  )
}

export default App