import { useState, useEffect } from 'react';

const metrics = {
  AV: {
    label: "Attack Vector", values: {
      N: 0.85, A: 0.62, L: 0.55, P: 0.2
    }, names: {
      N: "Network", A: "Adjacent", L: "Local", P: "Physical"
    }
  },
  AC: {
    label: "Attack Complexity", values: {
      L: 0.77, H: 0.44
    }, names: {
      L: "Low", H: "High"
    }
  },
  PR: {
    label: "Privileges Required", values: {
      N: 0.85, L: 0.62, H: 0.27
    }, names: {
      N: "None", L: "Low", H: "High"
    }
  },
  UI: {
    label: "User Interaction", values: {
      N: 0.85, R: 0.62
    }, names: {
      N: "None", R: "Required"
    }
  },
  S: {
    label: "Scope", values: {
      U: 0, C: 1
    }, names: {
      U: "Unchanged", C: "Changed"
    }
  },
  C: {
    label: "Confidentiality", values: {
      H: 0.56, L: 0.22, N: 0.0
    }, names: {
      H: "High", L: "Low", N: "None"
    }
  },
  I: {
    label: "Integrity", values: {
      H: 0.56, L: 0.22, N: 0.0
    }, names: {
      H: "High", L: "Low", N: "None"
    }
  },
  A: {
    label: "Availability", values: {
      H: 0.56, L: 0.22, N: 0.0
    }, names: {
      H: "High", L: "Low", N: "None"
    }
  }
};

function CVSSCalculator({ selected = [], onScoreUpdate }) {
  const [values, setValues] = useState({});

  const handleChange = (key, value) => {
    const updated = { ...values, [key]: value };
    setValues(updated);
  };

  const calculateScore = () => {
    const { AV, AC, PR, UI, S, C, I, A } = values;
    if (!(AV && AC && PR && UI && S && C && I && A)) return null;

    const prVal = S === 'U' ? metrics.PR.values[PR] : (PR === 'N' ? 0.85 : PR === 'L' ? 0.68 : 0.5);
    const iss = 1 - ((1 - metrics.C.values[C]) * (1 - metrics.I.values[I]) * (1 - metrics.A.values[A]));
    const impact = S === 'U' ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    const exploitability = 8.22 * metrics.AV.values[AV] * metrics.AC.values[AC] * prVal * metrics.UI.values[UI];
    let score = (impact <= 0) ? 0 : (S === 'U' ? Math.min(impact + exploitability, 10) : Math.min(1.08 * (impact + exploitability), 10));
    score = Math.ceil(score * 10) / 10;

    const vector = `CVSS:3.1/AV:${AV}/AC:${AC}/PR:${PR}/UI:${UI}/S:${S}/C:${C}/I:${I}/A:${A}`;
    return { score, vector };
  };

  useEffect(() => {
    const result = calculateScore();
    if (result && onScoreUpdate) onScoreUpdate(result);
  }, [values]);

  const renderDropdown = (key) => (
    <div className="w-full">
      <label className="block">{metrics[key].label}</label>
      <select className="w-full border p-2" value={values[key] || ''} onChange={e => handleChange(key, e.target.value)}>
        <option value="">Select</option>
        {Object.entries(metrics[key].names).map(([abbr, label]) => (
          <option key={abbr} value={abbr}>{label} ({abbr})</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">CVSS v3.1 Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-4">{renderDropdown('AV')}{renderDropdown('AC')}</div>
        <div className="flex gap-4">{renderDropdown('PR')}{renderDropdown('UI')}</div>
        {renderDropdown('S')}
        {renderDropdown('C')}
        {renderDropdown('I')}
        {renderDropdown('A')}
      </div>

      {calculateScore() && (
        <div className="mt-6 p-4 border rounded bg-gray-50 space-y-2">
          <div><strong>CVSS Score:</strong> {calculateScore().score}</div>
          <div><strong>CVSS Vector:</strong> {calculateScore().vector}</div>
        </div>
      )}
    </div>
  );
}

export default CVSSCalculator;
