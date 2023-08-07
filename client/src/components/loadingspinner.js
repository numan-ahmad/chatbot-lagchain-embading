import "./loadingspinner.css";
export default function LoadingSpinner() {
  return (
    <center>
      <div style={{ backgroundColor: "black", width: "100%", height: "100%" }}>
        <div class="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </center>
  );
}
