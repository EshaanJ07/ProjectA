const AudioCircle = () => {
  return (
    <div className=" shodow-xl relative flex-center h-75 w-75 rounded-full bg-gradient-to-r from-[#34D399] to-[#818CF8] animate-spin [animation-duration:3s]">
      <div className="absolute h-60 w-60 rounded-full bg-white"></div>
      <div className="absolute h-50 w-50 rounded-full bg-[#4338CA] hidden"></div>
    </div>
  );
};

export default AudioCircle;
