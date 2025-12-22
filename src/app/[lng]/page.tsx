"use client";

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslation } from '../i18n/client'

import { useState } from "react";
import sendRequest from "../services/api_connector"

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

  return (
    <>
      <div className="flex items-center justify-center mt-[100px]">
        <span className='text-xl'>{t('title')}</span>
      </div>
      <div className="flex items-center justify-center mt-[50px]">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-[800px]">
          {players.map((player, index) => (
            <div className="flex w-full" key={index}>
              <div className="flex-1 mb-2 mr-2">
                <label htmlFor={"playerLevel" + (index + 1)} className="block text-lg text-gray-700 font-medium">
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
                  <div className="text-red-500">{t('error_level')}</div>)}
              </div>
              <div className=" flex-1 mb-2">
                <label htmlFor="player1" className="block text-lg text-gray-700 font-medium">
                  {t('player').charAt(0).toUpperCase() + t('player').slice(1)} {index + 1} {t('reliability').charAt(0).toUpperCase() + t('reliability').slice(1)}
                </label>
                <input
                  type="text"
                  value={player.reliability}
                  className="w-full mt-1 p-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => handlePlayerChange(index, e.target.value, 'reliability')}
                />
                {showError && (player.reliability === "0") && (
                  <div className="text-red-500">{t('error_reliability')}</div>)}
              </div>
            </div>
          ))}
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
      {showProbability && (<div className="flex flex-col items-center mt-[35px] text-xl">
        <label>{t('couple_probability')} 1: {(coupleProbability.probability_couple_1 * 100).toFixed(2)}% {winningCouple === 1 && <>🏆</>}{(winningCouple !== 1 && winningCouple !== -1) && <>👎</>}{winningCouple == -1 && <>😑</>}</label>
        <label>{t('couple_probability')} 2: {(coupleProbability.probability_couple_2 * 100).toFixed(2)}% {winningCouple === 2 && <>🏆</>}{(winningCouple !== 2 && winningCouple !== -1) && <>👎</>}{winningCouple == -1 && <>😑</>}</label>
      </div>)}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500 bg-white border-t border-gray-200">
        {t('disclaimer')}
      </footer>
    </>
  );
}