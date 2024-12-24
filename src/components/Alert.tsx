import "./Alert.css";

interface AlertProps {
  message: string;
  onYes: () => void;
  onNo: () => void;
}

export function Alert({ message, onYes, onNo }: AlertProps) {
  return (
    <div className="alert-overlay">
      <div className="alert">
        <p>{message}</p>
        <div className="alert-buttons">
          <button onClick={onYes}>Yes</button>
          <button onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
}
