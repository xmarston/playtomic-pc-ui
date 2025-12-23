"use client";

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslation } from '../i18n/client'

import { useState, useEffect, useRef } from "react";
import sendRequest, { extractLevelsFromImage } from "../services/api_connector"

interface Player {
  level: string;
  reliability: string;
}

interface ProbabilityResponse {
  probability_couple_1: number;
  probability_couple_2: number;
}

const placeHolderPlayers: Player = { level: "0", reliability: "0" };
const initialPlayers: Player[] = [placeHolderPlayers, placeHolderPlayers, placeHolderPlayers, placeHolderPlayers];

export default function Home() {
  const params = useParams();
  const lng = params.lng as string;
  const { t, isReady } = useTranslation(lng, 'common', {})

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [showError, setShowError] = useState(false);
  const [coupleProbability, setCoupleProbability] = useState<ProbabilityResponse>({ probability_couple_1: 0, probability_couple_2: 0 });
  const [showProbability, setShowProbability] = useState(false);
  const [loading, setLoading] = useState(false);
  const [winningCouple, setWinningCouple] = useState(0);
  const [extractingLevels, setExtractingLevels] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageInfo, setShowImageInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageInfoRef.current && !imageInfoRef.current.contains(event.target as Node)) {
        setShowImageInfo(false);
      }
    };

    if (showImageInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageInfo]);

  if (!isReady) return null;

  const handlePlayerChange = (index: number, value: string, key: keyof Player) => {
    if (/^\d*\.?\d*$/.test(value)) {
      if (key === 'level') {
        const newValue = parseFloat(value);
        if (newValue >= 7) {
          value = '7';
        }
      }
      if (key === 'reliability') {
        const newValue = parseFloat(value);
        if (newValue >= 100) {
          value = '100';
        }
      }
      const newPlayers = [...players];
      newPlayers[index] = { ...newPlayers[index], [key]: value }; // Mantener como string
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowError(true);

    let proceedWithSubmission = true;

    const numericPlayers = players.map(player => {
      const level = parseFloat(player.level);
      const reliability = parseFloat(player.reliability);
      if ((level === 0 || isNaN(level)) || (reliability === 0 || isNaN(reliability))) {
        proceedWithSubmission = false;
      }
      return { level, reliability };
    });

    if (proceedWithSubmission) {
      setShowProbability(false);
      setLoading(true);

      sendRequest(numericPlayers).then((response: ProbabilityResponse) => {
        setCoupleProbability(response);
        if (response.probability_couple_1 === response.probability_couple_2) {
          setWinningCouple(-1);
        }
        else if (response.probability_couple_1 > response.probability_couple_2) {
          setWinningCouple(1);
        } else {
          setWinningCouple(2);
        }
        setShowProbability(true);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setShowProbability(false);
        setLoading(false);
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setExtractError(null);
    }
  };

  const handleExtractLevels = async () => {
    if (!selectedImage) return;

    setExtractingLevels(true);
    setExtractError(null);

    try {
      const response = await extractLevelsFromImage(selectedImage);
      const newPlayers = [...players];
      newPlayers[0] = { ...newPlayers[0], level: response.player1_level.toString() };
      newPlayers[1] = { ...newPlayers[1], level: response.player2_level.toString() };
      newPlayers[2] = { ...newPlayers[2], level: response.player3_level.toString() };
      newPlayers[3] = { ...newPlayers[3], level: response.player4_level.toString() };
      setPlayers(newPlayers);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      setExtractError(t('extract_error'));
    } finally {
      setExtractingLevels(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="text-center mt-16 sm:mt-24 px-4">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">{t('title')}</h1>
        <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">
          {t('hero_title')}
        </p>
        <p className="text-sm sm:text-lg text-gray-400 max-w-xl mx-auto font-light">
          {t('hero_subtitle')}
        </p>
      </div>
      <div className="flex items-center justify-center mt-8 sm:mt-12">
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-md w-full max-w-[800px] mx-4 sm:mx-0">
          {/* Couple 1 */}
          <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4 bg-blue-50">
            <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-3">{t('couple')} 1</h3>
            {players.slice(0, 2).map((player, index) => (
              <div className="flex flex-col sm:flex-row w-full" key={index}>
                <div className="flex-1 mb-2 sm:mr-2">
                  <label htmlFor={"playerLevel" + (index + 1)} className="block text-sm sm:text-lg text-gray-700 font-medium">
                    {t('player').charAt(0).toUpperCase() + t('player').slice(1)} {index + 1} {t('level').charAt(0).toUpperCase() + t('level').slice(1)}
                  </label>
                  <input
                    id={"playerLevel" + (index + 1)}
                    type="text"
                    value={player.level}
                    className="w-full mt-1 p-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => handlePlayerChange(index, e.target.value, 'level')}
                  />
                  {showError && (player.level === "0") && (
                    <div className="text-red-500 text-sm">{t('error_level')}</div>)}
                </div>
                <div className="flex-1 mb-2">
                  <label htmlFor={"playerReliability" + (index + 1)} className="block text-sm sm:text-lg text-gray-700 font-medium">
                    {t('player').charAt(0).toUpperCase() + t('player').slice(1)} {index + 1} {t('reliability').charAt(0).toUpperCase() + t('reliability').slice(1)}
                  </label>
                  <input
                    type="text"
                    value={player.reliability}
                    className="w-full mt-1 p-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => handlePlayerChange(index, e.target.value, 'reliability')}
                  />
                  {showError && (player.reliability === "0") && (
                    <div className="text-red-500 text-sm">{t('error_reliability')}</div>)}
                </div>
              </div>
            ))}
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-0.5 bg-gray-300"></div>
            <span className="mx-4 text-xl sm:text-2xl font-bold text-gray-500">VS</span>
            <div className="flex-1 h-0.5 bg-gray-300"></div>
          </div>

          {/* Couple 2 */}
          <div className="border-2 border-orange-200 rounded-lg p-3 sm:p-4 mb-4 bg-orange-50">
            <h3 className="text-base sm:text-lg font-semibold text-orange-700 mb-3">{t('couple')} 2</h3>
            {players.slice(2, 4).map((player, sliceIndex) => {
              const index = sliceIndex + 2;
              return (
                <div className="flex flex-col sm:flex-row w-full" key={index}>
                  <div className="flex-1 mb-2 sm:mr-2">
                    <label htmlFor={"playerLevel" + (index + 1)} className="block text-sm sm:text-lg text-gray-700 font-medium">
                      {t('player').charAt(0).toUpperCase() + t('player').slice(1)} {index + 1} {t('level').charAt(0).toUpperCase() + t('level').slice(1)}
                    </label>
                    <input
                      id={"playerLevel" + (index + 1)}
                      type="text"
                      value={player.level}
                      className="w-full mt-1 p-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handlePlayerChange(index, e.target.value, 'level')}
                    />
                    {showError && (player.level === "0") && (
                      <div className="text-red-500 text-sm">{t('error_level')}</div>)}
                  </div>
                  <div className="flex-1 mb-2">
                    <label htmlFor={"playerReliability" + (index + 1)} className="block text-sm sm:text-lg text-gray-700 font-medium">
                      {t('player').charAt(0).toUpperCase() + t('player').slice(1)} {index + 1} {t('reliability').charAt(0).toUpperCase() + t('reliability').slice(1)}
                    </label>
                    <input
                      type="text"
                      value={player.reliability}
                      className="w-full mt-1 p-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handlePlayerChange(index, e.target.value, 'reliability')}
                    />
                    {showError && (player.reliability === "0") && (
                      <div className="text-red-500 text-sm">{t('error_reliability')}</div>)}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center space-x-2 px-4 py-2">
              <span>{t('calculate')}</span>
              {loading && (
                <Image src="/images/clock.svg" className="loading-svg" alt={t('loading')} width={24} height={24} />
              )}
            </div>
          </button>
        </form>
      </div>

      {/* Probability Results */}
      {showProbability && (
        <div className="flex items-center justify-center mt-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-[800px] mx-4 sm:mx-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 text-center">{t('results')}</h3>

            <div className="space-y-4">
              {/* Couple 1 Result */}
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${winningCouple === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">{t('couple')} 1</span>
                    {winningCouple === 1 && <span className="text-xl">🏆</span>}
                    {winningCouple !== 1 && winningCouple !== -1 && <span className="text-lg">👎</span>}
                    {winningCouple === -1 && <span className="text-lg">😑</span>}
                  </div>
                  <span className={`text-xl sm:text-2xl font-bold ${winningCouple === 1 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {(coupleProbability.probability_couple_1 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${winningCouple === 1 ? 'bg-blue-500' : 'bg-blue-300'}`}
                    style={{ width: `${coupleProbability.probability_couple_1 * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Couple 2 Result */}
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${winningCouple === 2 ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-700">{t('couple')} 2</span>
                    {winningCouple === 2 && <span className="text-xl">🏆</span>}
                    {winningCouple !== 2 && winningCouple !== -1 && <span className="text-lg">👎</span>}
                    {winningCouple === -1 && <span className="text-lg">😑</span>}
                  </div>
                  <span className={`text-xl sm:text-2xl font-bold ${winningCouple === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                    {(coupleProbability.probability_couple_2 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${winningCouple === 2 ? 'bg-orange-500' : 'bg-orange-300'}`}
                    style={{ width: `${coupleProbability.probability_couple_2 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Section */}
      <div className="flex items-center justify-center mt-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-[800px] mx-4 sm:mx-0 relative">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">{t('upload_image')}</h3>
            <button
              type="button"
              onClick={() => setShowImageInfo(!showImageInfo)}
              className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center transition-colors"
              aria-label={t('image_info_title')}
            >
              i
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{t('upload_image_description')}</p>

          {/* Info Popover */}
          {showImageInfo && (
            <div ref={imageInfoRef} className="absolute left-0 right-0 mx-4 sm:mx-0 top-full mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-700">{t('image_info_title')}</h4>
                <button
                  type="button"
                  onClick={() => setShowImageInfo(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t('image_info_description')}</p>
              <div className="rounded-md overflow-hidden border border-gray-200">
                <Image
                  src="/images/match_example.png"
                  alt={t('image_info_title')}
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-600">
                  {selectedImage ? selectedImage.name : t('select_image')}
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleExtractLevels}
              disabled={!selectedImage || extractingLevels}
              className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{t('extract_levels')}</span>
                {extractingLevels && (
                  <Image src="/images/clock.svg" className="loading-svg" alt={t('extracting')} width={20} height={20} />
                )}
              </div>
            </button>
          </div>

          {extractError && (
            <div className="mt-3 text-red-500 text-sm">{extractError}</div>
          )}
        </div>
      </div>

      {/* Adsterra Ad */}
      <div className="w-full max-w-[800px] mx-auto mt-8 mb-8 px-4">
        <script async data-cfasync="false" src="https://pl28316863.effectivegatecpm.com/75b96ef891e28987664f37a5c9f0fdad/invoke.js"></script>
        <div id="container-75b96ef891e28987664f37a5c9f0fdad"></div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500 bg-white border-t border-gray-200">
        {t('disclaimer')}
      </footer>
    </div>
  );
}