
import React, { useState, useEffect, useRef } from "react";
import "./ui/ripple.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  Rewind,
  FastForward,
  Play,
  Pause,
  MessageCircle,
  Phone,
  X,
  Loader,
  Key
} from "lucide-react";

const LoadingSkeleton = () => {
  return (
    <div className="w-full h-full max-h-[900px] sm:max-w-[375px] bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col mb-6 relative animate-pulse">
      {/* Author Image Skeleton */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 border-4 border-white" />
      </div>

      {/* Book Image Skeleton */}
      <div className="relative w-full pt-[50%]">
        <div className="absolute inset-0 bg-gray-200" />
      </div>

      {/* Book Info Card Skeleton */}
      <div className="relative -mt-10 px-6 z-10">
        <div className="bg-white rounded-[20px] p-4 shadow-lg">
          <div className="h-6 bg-gray-200 rounded-full w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto mb-3" />
          <div className="flex justify-center">
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Chapters List Skeleton */}
      <div className="flex-1 min-h-0 px-6 mt-4 mb-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="py-2 sm:py-2.5 border-b border-gray-200">
            <div className="px-2">
              <div className="h-3 bg-gray-200 rounded-full w-16 mb-1" />
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Controls Section Skeleton */}
      <div className="bg-gray-100 shadow-lg rounded-t-[30px] p-4">
        <div className="flex justify-center mb-3">
          <div className="h-10 w-32 bg-gray-200 rounded-full" />
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center">
          <div className="h-4 w-8 bg-gray-200 rounded-full" />
          <div className="flex-grow mx-2">
            <div className="h-1 w-full bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = () => {
  const navigate = useNavigate();
  const boooknaame = "ArtOfConversation"
  const name = "user"
  const bookName = "ArtOfConversation"
  const Name = "ArtOfConversation"
  // Group all useState declarations together
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [authorImageSrc, setAuthorImageSrc] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [persona, setPersona] = useState("");
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answerAudioSrc, setAnswerAudioSrc] = useState("");
  const [isAnswerPlaying, setIsAnswerPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);

  const answerAudioRef = useRef(null);
  const afterAnswerAudioRef = useRef(null);

  const getFullAudioUrl = (path) => {
    const baseUrl = "https://contractus.co.in";
    return `${baseUrl}${path}`;
  };


  const handlePreviousChaptermain = () => {
    if (currentChapter > 0) {
      playChapter(currentChapter - 1);
    }
  };

  const handleNextChaptermain = () => {
    if (currentChapter < chapters.length - 1) {
      playChapter(currentChapter + 1);
    }
  };


  useEffect(() => {
    const authCode = localStorage.getItem('authCode');
    
    if (authCode !== 'pluto_success') {
      navigate('/login');
    }
  }, []);




  useEffect(() => {
    const fetchAudiobook = async () => {
      try {
        const response = await fetch("https://contractus.co.in/api/audiobook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, bookName }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch audiobook");
        }

        const data = await response.json();
        if (data.chapters && data.chapters.length > 0) {
          setAudioSrc(data.chapters[0].url);
        } else {
          throw new Error("No chapters found in the response");
        }

        setImageSrc(data.imageSrc);
        setAuthorImageSrc(data.authorImageSrc);
        setAuthorName(data.authorName);
        setPersona(data.persona);
        setChapters(data.chapters);
        setError("");
      } catch (error) {
        console.error("Error fetching audiobook:", error);
        setError("Failed to load audiobook. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudiobook();
  }, [name, bookName]);

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.onerror = (e) => {
        console.error("Initial audio error:", e);
        setError(`Failed to load initial audio. Error: ${e.type}`);
      };
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      setAudioElement(audio);
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioSrc]);

  useEffect(() => {
    if (audioElement) {
      const handleEnded = () => {
        if (currentChapter < chapters.length - 1) {
          playChapter(currentChapter + 1);
        } else {
          setIsPlaying(false);
        }
      };

      audioElement.addEventListener("ended", handleEnded);
      return () => {
        audioElement.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioElement, currentChapter, chapters]);

  useEffect(() => {
    if (answerAudioSrc) {
      const fullAudioUrl = getFullAudioUrl(answerAudioSrc);
      console.log("Full answer audio URL:", fullAudioUrl);

      fetch(fullAudioUrl, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            setupAudio(fullAudioUrl);
          } else {
            throw new Error(
              `Audio file not found: ${response.status} ${response.statusText}`
            );
          }
        })
        .catch((error) => {
          console.error("Error checking audio file:", error);
          setError(`Failed to load answer audio: ${error.message}`);
        });
    }
  }, [answerAudioSrc]);

  const setupAudio = (url) => {
    if (answerAudioRef.current) {
      answerAudioRef.current.pause();
    }

    // Initialize after-answer audio
    afterAnswerAudioRef.current = new Audio("/audios/afteranswer.mp3");
    afterAnswerAudioRef.current.onerror = (e) => {
      console.error("After-answer audio error:", e);
      setError(`Failed to load after-answer audio. Error: ${e.type}`);
    };

    answerAudioRef.current = new Audio(url);
    answerAudioRef.current.onerror = (e) => {
      console.error("Answer audio error:", e);
      setError(`Failed to load answer audio. Error: ${e.type}`);
    };

    answerAudioRef.current.addEventListener("loadedmetadata", () => {
      console.log("Audio metadata loaded successfully");
    });

    answerAudioRef.current.addEventListener("canplaythrough", () => {
      console.log("Audio can play through");
      playAnswerAudio();
    });

    answerAudioRef.current.addEventListener("ended", () => {
      playAfterAnswerAudio();
    });

    afterAnswerAudioRef.current.addEventListener("ended", () => {
      setIsAnswerPlaying(false);
      resumeMainAudio();
    });
  };

  const playAnswerAudio = () => {
    if (answerAudioRef.current) {
      answerAudioRef.current
        .play()
        .then(() => {
          setIsAnswerPlaying(true);
        })
        .catch((e) => {
          console.error("Failed to play answer audio:", e);
          setError(`Failed to play answer audio. Error: ${e.message}`);
        });
    }
  };



  const progressBarRef = useRef(null);

  const handleSeek = (e) => {
    if (audioElement && progressBarRef.current) {
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const seekPosition = (e.clientX - rect.left) / rect.width;
      const newTime = seekPosition * duration;
      
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Ensure audio is playing after seeking
      if (!isPlaying) {
        audioElement.play().catch((e) => {
          console.error("Failed to play audio after seeking:", e);
          setError(`Failed to play audio. Error: ${e.message}`);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleProgressBarInteraction = (e) => {
    e.preventDefault();
    handleSeek(e);

    // Add event listeners for mouse move and mouse up
    const handleMouseMove = (moveEvent) => {
      handleSeek(moveEvent);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };







  const playAfterAnswerAudio = () => {
    if (afterAnswerAudioRef.current) {
      afterAnswerAudioRef.current
        .play()
        .then(() => {
          console.log("Playing after-answer audio");
        })
        .catch((e) => {
          console.error("Failed to play after-answer audio:", e);
          setError(`Failed to play after-answer audio. Error: ${e.message}`);
          // If after-answer audio fails, still continue to main audio
          setIsAnswerPlaying(false);
          resumeMainAudio();
        });
    }
  };

  const resumeMainAudio = () => {
    if (audioElement) {
      audioElement.currentTime = lastPlayedTime;
      audioElement.play().catch((e) => {
        console.error("Failed to resume main audio:", e);
        setError(`Failed to resume main audio. Error: ${e.message}`);
      });
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setLastPlayedTime(audioElement.currentTime);
      } else {
        audioElement.play().catch((e) => {
          console.error("Failed to play audio:", e);
          setError(`Failed to play audio. Error: ${e.message}`);
        });
      }
      setIsPlaying(!isPlaying);
    } else if (chapters.length > 0) {
      playChapter(0);
    }
  };


  

  const playChapter = (index) => {
    if (audioElement) {
      audioElement.pause();
    }
    setCurrentChapter(index);
    const newAudio = new Audio(chapters[index].url);
    newAudio.onloadedmetadata = () => {
      setDuration(newAudio.duration);
    };
    newAudio.ontimeupdate = () => {
      setCurrentTime(newAudio.currentTime);
    };
    setAudioElement(newAudio);
    newAudio.play().catch((e) => {
      console.error("Failed to play chapter audio:", e);
      setError(`Failed to play chapter audio. Error: ${e.message}`);
    });
    setIsPlaying(true);
  };

  const handleNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      playChapter(currentChapter + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapter > 0) {
      playChapter(currentChapter - 1);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setLastPlayedTime(audioElement.currentTime);
    }

    setIsProcessing(true);

    try {
      let route;
      if (bookName == "YoutubeGrowth") route = "askquestion";
      else route = "askquestion1";
      const response = await fetch(`"https://contractus.co.in/${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, persona, Name, bookName }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer);
      setAnswerAudioSrc(data.audioUrl);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Failed to get an answer. Please try again.");
      setError(`Failed to get answer. Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuestion("");
    setAnswer("");
    setError("");
  };

  const rippleElements = [
    { duration: "1s", delay: "0.1s" },
    { duration: "1s", delay: "0.2s" },
    { duration: "1s", delay: "0.3s" },
  ];

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="w-full h-full max-h-[900px] sm:max-w-[375px] bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col mb-6 relative">
          {/* Author Image - Positioned above book image */}
          <div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${
              !isModalOpen ? "z-10" : ""
            }`}
          >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg">
                <img
                  src={authorImageSrc || "/api/placeholder/96/96"}
                  alt="Author"
                  className="w-full h-full object-cover"
                />
              </div>
              {isAnswerPlaying &&
                rippleElements.map((ripple, index) => (
                  <div
                    key={index}
                    className="absolute rounded-full border border-blue-300"
                    style={{
                      animation: `ripple ${ripple.duration} ease-out ${ripple.delay} infinite`,
                      width: "120%",
                      height: "120%",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: 0.7,
                    }}
                  />
                ))}
            </div>
          </div>

          {/* Book Image Section - Adjusted height */}
          <div className="relative w-full pt-[30vh] ">
            <div className="absolute inset-0">
              <div
                className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                  isAnswerPlaying
                    ? "bg-gradient-to-b from-blue-600 to-blue-800 filter blur-sm"
                    : ""
                }`}
              />
              <img
                src={imageSrc || "/api/placeholder/375/288"}
                alt="Book cover"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                  isAnswerPlaying ? "filter blur-sm" : ""
                }`}
              />
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                  isAnswerPlaying ? "opacity-30" : "opacity-0"
                }`}
              />
            </div>
          </div>

          {/* Book Info Card - Overlapping the image */}
          {/* <div className={`relative -mt-10 px-6 ${!isModalOpen ? "z-10" : ""}`}>
            <div className="bg-white rounded-[20px] p-4 shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-1">
                Art of Conversation
              </h2>
              <p className="text-sm sm:text-base text-center text-gray-600" style={{ marginBottom: "9px" }}>
  Interactive Audiobook
</p>


<div className="flex justify-center mb-3">
              <button
     onClick={() =>
      (window.location.href = "https://www.delphi.ai/pluto/call")
    }
                className="bg-[#0e2a57] text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-blue-600 transition-colors"              >
                <Phone size={18} />
                <span className="text-sm">Talk & Learn</span>
              </button>
            </div>
            </div>
          </div>

      */}

          {/* Controls Section */}
          <div className="bg-white shadow-xl rounded-[30px] p-4" style={{ height: '38vh' }}>
  <div className="px-2 mt-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Art of Conversation</h2>
      <div 
  onClick={() => window.location.href = "https://getpluto.in/upgrade"}
  className="cursor-pointer px-2 py-1 rounded-full flex items-center justify-center"
  style={{ backgroundColor: '#002244' }}
>
  <span className="text-[10px] text-white">Upgrade</span>
</div>
    </div>
    <p className="text-sm text-gray-500">Interactive Audiobook</p>
  </div>

  <div className="flex justify-center mb-3">
  </div>

  <div className="flex items-center mt-6">
        <span className="text-xs text-gray-500 w-8">
          {formatTime(currentTime)}
        </span>
        <div 
          ref={progressBarRef}
          className="flex-grow mx-2 h-1 bg-gray-300 rounded-full cursor-pointer relative"
          onMouseDown={handleProgressBarInteraction}
        >
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full shadow-md -ml-2 -mt-1.5 transform transition-transform hover:scale-125"
            style={{ 
              left: `${(currentTime / duration) * 100}%`,
              cursor: 'pointer'
            }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">
          {formatTime(duration)}
        </span>
      </div>

<div className="flex justify-center items-center mb-3 mt-8 gap-20">
  <div className="flex flex-col items-center">
    <button
      onClick={togglePlayPause}
      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black-500 shadow-md hover:shadow-lg transition-shadow mb-3 border-2 border-gray-300"
    >
      {isPlaying ? <Pause size={18} fill ="black"/> : <Play size={18} fill ="black"/>}
    </button>
    <span className="text-[11px] text-gray-500">Play</span>
  </div>

  <div className="flex flex-col items-center">
    <button
      onClick={() =>
        (window.location.href = "https://www.delphi.ai/pluto/call")
      }
      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black-500 shadow-md hover:shadow-lg transition-shadow mb-3 border-2 border-gray-300"
    >
      <Phone size={18} fill ="black"/>
    </button>
    <span className="text-[11px] text-gray-500">Talk & Learn</span>
  </div>
</div>
</div>


     {/* Chapters List - Adjusted height */}
     <div className="flex-1 min-h-0 px-6 mt-2 mb-4 overflow-hidden">
  <h3 className="text-center text-xs text-gray-500 mb-2">Chapters</h3>
  <div className="h-full overflow-y-auto custom-scrollbar">
    {chapters.map((chapter, index) => (
      <div
        key={index}
        onClick={() => playChapter(index)}
        className={`py-2 sm:py-2.5 border-b border-gray-200 first:border-t ${
          currentChapter === index ? "bg-gray-50" : ""
        } cursor-pointer transition-colors`}
      >
        <div className="px-2">
          <p className="text-xs text-gray-400 mb-0.5">
            Chapter {index}
          </p>
          <p
            className={`text-sm text-gray-900 ${
              currentChapter === index ? "font-bold" : ""
            }`}
          >
            {chapter.title || `Chapter ${index + 1}`}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>

<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0,0,0,0.3);
  }
`}</style>

        </div>
      )}

    </div>
  );
};

export default AudioPlayer;
