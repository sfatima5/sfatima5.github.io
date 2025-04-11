import { useState, useEffect } from "https://cdn.skypack.dev/react";
import { createRoot } from "https://cdn.skypack.dev/react-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "https://cdn.skypack.dev/react-router-dom";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const correctPassword = "2025tulips";

  const handleLogin = () => {
    if (passwordInput === correctPassword) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password!");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">🔒 Enter Password</h1>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-3 rounded mb-4 w-72"
          placeholder="Password"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="p-6 bg-gray-100 min-h-screen">
        <nav className="mb-6 flex gap-6 text-lg">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <Link to="/saved" className="text-blue-600 hover:underline">Saved Words</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saved" element={<Saved />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState(null);
  const [error, setError] = useState("");

  const fetchDefinition = async () => {
    if (!word) return;
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const entry = data[0];
        const meaning = entry.meanings[0]?.definitions[0] || {};
        setDefinition({
          definition: meaning.definition || "No definition found.",
          example: meaning.example || null,
          synonyms: meaning.synonyms || [],
          audio: entry.phonetics.find(p => p.audio)?.audio || null,
        });
        setError("");
      } else {
        throw new Error();
      }
    } catch {
      setDefinition(null);
      setError("Definition not found.");
    }
  };

  const saveWord = () => {
    const saved = JSON.parse(localStorage.getItem("savedWords") || "[]");
    saved.push({ word, ...definition });
    localStorage.setItem("savedWords", JSON.stringify(saved));
    alert("Word saved!");
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📚 Dictionary App</h1>
      <input
        type="text"
        placeholder="Enter a word"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        className="border p-3 w-full rounded mb-4"
      />
      <button onClick={fetchDefinition} className="bg-blue-600 text-white px-6 py-2 rounded mb-6 hover:bg-blue-700">
        Get Definition
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {definition && (
        <div className="border p-6 rounded bg-white shadow-md">
          <p><strong>Definition:</strong> {definition.definition}</p>
          {definition.example && <p className="mt-2"><strong>Example:</strong> "{definition.example}"</p>}
          {definition.synonyms.length > 0 && (
            <p className="mt-2"><strong>Synonyms:</strong> {definition.synonyms.slice(0,5).join(", ")}</p>
          )}
          {definition.audio && (
            <audio controls className="mt-4">
              <source src={definition.audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
          <button onClick={saveWord} className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Save Word
          </button>
        </div>
      )}
    </div>
  );
}

function Saved() {
  const [savedWords, setSavedWords] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedWords") || "[]");
    setSavedWords(saved);
  }, []);

  const deleteWord = (index) => {
    const updated = [...savedWords];
    updated.splice(index, 1);
    setSavedWords(updated);
    localStorage.setItem("savedWords", JSON.stringify(updated));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">💾 Saved Words</h1>
      {savedWords.length === 0 ? (
        <p>No saved words yet.</p>
      ) : (
        <ul className="space-y-6">
          {savedWords.map((item, index) => (
            <li key={index} className="border p-6 bg-white rounded shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{item.word}</h2>
                <button
                  onClick={() => deleteWord(index)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
              <p><strong>Definition:</strong> {item.definition}</p>
              {item.example && <p className="mt-2"><strong>Example:</strong> "{item.example}"</p>}
              {item.synonyms.length > 0 && (
                <p className="mt-2"><strong>Synonyms:</strong> {item.synonyms.slice(0,5).join(", ")}</p>
              )}
              {item.audio && (
                <audio controls className="mt-4">
                  <source src={item.audio} type="audio/mpeg" />
                </audio>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
