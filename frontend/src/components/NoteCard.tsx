interface NoteCard {
  title: string;
  lastActivity: string;
  teamMembers: number;
  image: string;
  memberAvatars: string[];
}
export default function NoteCard(props: NoteCard) {
  return (
    <div className="flex flex-col items-stretch justify-start rounded-xl bg-white dark:bg-[#1f1d33] shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div
        className="w-full bg-center bg-no-repeat aspect-16/10 bg-cover"
        data-alt="Abstract gradient with blue and purple hues for Project Phoenix note"
        // style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfS7g1f6yGj548MHF3hDtZL-DhI8QeK3dZeQWlo_oI6h6YWnO0JF2PNLFzhn2WR2aPhrdRLu4kTnJ7Ssp_e45L8ZqM9xWWRFc5SP8uz41yM__RCjRg9AR-TBxpP0CxPJVDjI1tMZWZUT_0W6BOvPv0Zp4TkB0Jv8bhAsvY2gsDYZIfQ_Ra2Bwp5xX2LLp8qYOfNfRu96oHTDQ3mY4gcqytJXCvjICFNJx1oLD0ed_Q12vuWPM15H-vRCF8gMxgZn9VS_jobB-s0msH');"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfS7g1f6yGj548MHF3hDtZL-DhI8QeK3dZeQWlo_oI6h6YWnO0JF2PNLFzhn2WR2aPhrdRLu4kTnJ7Ssp_e45L8ZqM9xWWRFc5SP8uz41yM__RCjRg9AR-TBxpP0CxPJVDjI1tMZWZUT_0W6BOvPv0Zp4TkB0Jv8bhAsvY2gsDYZIfQ_Ra2Bwp5xX2LLp8qYOfNfRu96oHTDQ3mY4gcqytJXCvjICFNJx1oLD0ed_Q12vuWPM15H-vRCF8gMxgZn9VS_jobB-s0msH')",
        }}
      ></div>
      <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
        <p className="text-[#0f0e1b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          {props.title}
        </p>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#564f96] dark:text-gray-400 text-base">Person</span>
            <p className="text-[#564f96] dark:text-gray-400 text-sm font-normal leading-normal">{props.lastActivity}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden mr-1">
              {props.memberAvatars.map((avatar, index) => (
                <img
                  key={index}
                  alt="Team member avatar"
                  className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-[#1f1d33]"
                  src={avatar}
                />
              ))}
            </div>
            <p className="text-[#564f96] dark:text-gray-400 text-sm font-normal leading-normal">
              {props.teamMembers}team members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
