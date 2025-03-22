import { useState, useRef, useEffect } from "react";
import "./TimestampComparer.css";
import { Trash2, Edit2 } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(duration);

interface TimestampData {
  id: string;
  value: string;
  parsed: dayjs.Dayjs | null;
  error?: string;
  isEditing?: boolean;
}

export const getDurationFromNow = (epochTimestamp: number): string => {
  const now = dayjs();
  const inputTime = dayjs(epochTimestamp);
  const duration = dayjs.duration(now.diff(inputTime));

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0) result += `${seconds}s`;

  return result.trim() || '0s';
};

export function TimestampComparer() {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<TimestampData[]>(() => {
    const saved = localStorage.getItem("timestamps");
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      // Restore dayjs objects from saved timestamps
      return parsed.map((ts: any) => ({
        id: ts.id,
        value: ts.value,
        parsed: ts.parsed ? dayjs(Number(ts.parsed)) : null,
        error: ts.error,
        isEditing: false
      }));
    } catch {
      return [];
    }
  });
  const [referenceIndex, setReferenceIndex] = useState<number>(() => {
    const saved = localStorage.getItem("timestampReferenceIndex");
    return saved ? parseInt(saved, 10) : 0;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Save timestamps when they change
  useEffect(() => {
    const timestampsToSave = timestamps.map(ts => ({
      id: ts.id,
      value: ts.value,
      parsed: ts.parsed ? ts.parsed.valueOf() : null,
      error: ts.error
    }));
    localStorage.setItem("timestamps", JSON.stringify(timestampsToSave));
  }, [timestamps]);

  // Save reference index when it changes
  useEffect(() => {
    localStorage.setItem("timestampReferenceIndex", referenceIndex.toString());
  }, [referenceIndex]);

  const findDuplicates = (value: string | number): TimestampData | undefined => {
    const num = Number(value);
    if (isNaN(num)) return undefined;
    
    return timestamps.find(ts => {
      const tsNum = Number(ts.value);
      return !isNaN(tsNum) && tsNum === num;
    });
  };

  const parseTimestamp = (value: string): dayjs.Dayjs | null => {
    const num = Number(value);
    if (isNaN(num)) return null;

    try {
      let milliseconds: number;
      
      // Handle different timestamp formats based on length
      if (value.length >= 19) {
        // Nanoseconds (or longer): convert to milliseconds
        milliseconds = Math.floor(num / 1000000);
      } else if (value.length >= 16) {
        // Microseconds: convert to milliseconds
        milliseconds = Math.floor(num / 1000);
      } else if (value.length >= 13) {
        // Already in milliseconds
        milliseconds = num;
      } else {
        // Seconds: convert to milliseconds
        milliseconds = num * 1000;
      }

      // Add validation for reasonable range
      if (milliseconds < 0 || milliseconds > 253402300799999) { // Year 9999
        return null;
      }

      const date = dayjs(milliseconds);
      return date.isValid() ? date : null;
    } catch {
      return null;
    }
  };

  const formatTimestamp = (date: dayjs.Dayjs | null): string => {
    if (!date) return 'Invalid Date';
    
    try {
      return date.format('YYYY-MM-DD HH:mm:ss.SSS');
    } catch {
      return 'Invalid Date';
    }
  };

  const getRelativeTime = (date: dayjs.Dayjs): string => {
    return getDurationFromNow(date.valueOf()) + ' ago';
  };

  // Helper function to determine timestamp format
  const getTimestampFormat = (value: string): string => {
    const length = value.length;
    if (length >= 19) return 'nanoseconds';
    if (length >= 16) return 'microseconds';
    if (length >= 13) return 'milliseconds';
    return 'seconds';
  };

  // Update validation to show format information
  const validateInput = (value: string): string | null => {
    if (!value.trim()) return null;
    
    // First try as a simple number
    const num = Number(value);
    if (!isNaN(num)) {
      const duplicate = findDuplicates(value);
      if (duplicate) {
        const format = getTimestampFormat(value);
        return `This timestamp (${format}) already exists (${formatTimestamp(duplicate.parsed)})`;
      }

      const now = dayjs();
      const parsed = parseTimestamp(value);
      if (!parsed) return "Invalid timestamp";
      if (parsed.valueOf() > now.valueOf()) return "Timestamp cannot be in the future";
      return null;
    }

    // If not a simple number, try as JSON array
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item !== 'number') {
            return "Array must contain only numbers";
          }
          const duplicate = findDuplicates(item);
          if (duplicate) {
            const format = getTimestampFormat(item.toString());
            return `Timestamp ${item} (${format}) already exists (${formatTimestamp(duplicate.parsed)})`;
          }
        }
        return null;
      }
      return "Please enter a number or array of numbers";
    } catch {
      return "Please enter a valid number or array of numbers";
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setInputError(validateInput(value));
  };

  const parseAndAddTimestamp = () => {
    if (!input.trim()) return;
    
    const error = validateInput(input);
    if (error) {
      setInputError(error);
      return;
    }

    // First try as a simple number
    const num = Number(input);
    if (!isNaN(num)) {
      const newTimestamp: TimestampData = {
        id: crypto.randomUUID(),
        value: input,
        parsed: parseTimestamp(input),
      };
      setTimestamps(prev => [newTimestamp, ...prev]);
      setInput("");
      setInputError(null);
      return;
    }

    // If not a simple number, try as JSON array
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const newTimestamps = parsed.map(value => ({
          id: crypto.randomUUID(),
          value: value.toString(),
          parsed: parseTimestamp(value.toString()),
        }));
        setTimestamps(prev => [...newTimestamps, ...prev]);
        setInput("");
        setInputError(null);
        return;
      }
    } catch {
      // This shouldn't happen because validateInput would catch it
      setInputError("Invalid input");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        parseAndAddTimestamp();
      }
    };

    const input = inputRef.current;
    input?.addEventListener("keydown", handleKeyDown);

    return () => {
      input?.removeEventListener("keydown", handleKeyDown);
    };
  }, [input]);

  const calculateDiff = (reference: dayjs.Dayjs, compare: dayjs.Dayjs): string => {
    const diffMs = compare.valueOf() - reference.valueOf();
    const absDiff = Math.abs(diffMs);
    
    let formatted = '';
    if (absDiff < 1000) {
      formatted = `${diffMs}ms`;
    } else if (absDiff < 60000) {
      formatted = `${(diffMs / 1000).toFixed(2)}s`;
    } else if (absDiff < 3600000) {
      formatted = `${(diffMs / 60000).toFixed(2)}min`;
    } else {
      formatted = `${(diffMs / 3600000).toFixed(2)}h`;
    }

    return diffMs > 0 ? '+' + formatted : formatted;
  };

  const removeTimestamp = (id: string) => {
    setTimestamps(prev => {
      const newTimestamps = prev.filter(ts => ts.id !== id);
      if (referenceIndex >= newTimestamps.length) {
        setReferenceIndex(0);
      }
      return newTimestamps;
    });
  };

  const startEditing = (id: string) => {
    setTimestamps(prev => prev.map(ts => ({
      ...ts,
      isEditing: ts.id === id
    })));
  };

  const updateTimestamp = (id: string, newValue: string) => {
    setTimestamps(prev => prev.map(ts => {
      if (ts.id === id) {
        const parsed = parseTimestamp(newValue);
        return {
          ...ts,
          value: newValue,
          parsed,
          error: !parsed && newValue ? "Invalid timestamp" : undefined,
          isEditing: false
        };
      }
      return ts;
    }));
  };

  return (
    <div className="tab-content">
      <div className="input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter timestamp or array of timestamps... (Ctrl+Enter to parse)"
            className={`timestamp-input-field ${inputError ? 'error' : ''}`}
            aria-label="Timestamp input"
          />
          {inputError && <div className="input-error">{inputError}</div>}
        </div>
        <button 
          className="parse-button" 
          onClick={parseAndAddTimestamp}
          disabled={!!inputError}
        >
          Parse Timestamp
        </button>
      </div>

      <div className="timestamps-list">
        {timestamps.map((ts, index) => (
          <div key={ts.id} className="timestamp-row">
            <div className="timestamp-details">
              <div className="parsed-time">
                {ts.isEditing ? (
                  <input
                    type="text"
                    value={ts.value}
                    onChange={(e) => updateTimestamp(ts.id, e.target.value)}
                    onBlur={() => updateTimestamp(ts.id, ts.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateTimestamp(ts.id, ts.value);
                      }
                    }}
                    autoFocus
                    className="timestamp-edit-field"
                    aria-label="Edit timestamp"
                  />
                ) : (
                  <>
                    <div className="timestamp-info">
                      <span className="timestamp-value">{ts.value}</span>
                      <span className="timestamp-format">
                        ({getTimestampFormat(ts.value)})
                      </span>
                    </div>
                    {ts.parsed && (
                      <>
                        <div className="timestamp-parsed-info">
                          <span className="timestamp-parsed">{formatTimestamp(ts.parsed)}</span>
                          <span className="timestamp-relative">
                            ({getRelativeTime(ts.parsed)})
                          </span>
                        </div>
                        <button
                          className={`set-reference ${referenceIndex === index ? 'active' : ''}`}
                          onClick={() => setReferenceIndex(index)}
                        >
                          Set as Reference
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="timestamp-actions">
                {ts.parsed && index !== referenceIndex && timestamps[referenceIndex].parsed && (
                  <div className="time-diff">
                    {calculateDiff(timestamps[referenceIndex].parsed!, ts.parsed)}
                  </div>
                )}
                <button
                  className="action-button"
                  onClick={() => startEditing(ts.id)}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-button"
                  onClick={() => removeTimestamp(ts.id)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {ts.error && <div className="timestamp-error">{ts.error}</div>}
          </div>
        ))}
      </div>
    </div>
  );
} 
