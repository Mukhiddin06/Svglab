const CodePanel = () => {
  return (
    <div className="p-4 h-full">
      <textarea
        className="w-full h-full border p-2"
        defaultValue={`<svg></svg>`}
      />
    </div>
  );
}

export default CodePanel