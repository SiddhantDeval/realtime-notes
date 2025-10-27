const dummyNotes = [
  {
    id: "1",
    title: "Project Phoenix - Kickoff",
    lastActivity: "John Doe commented 2 hrs ago",
    teamMembers: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfS7g1f6yGj548MHF3hDtZL-DhI8QeK3dZeQWlo_oI6h6YWnO0JF2PNLFzhn2WR2aPhrdRLu4kTnJ7Ssp_e45L8ZqM9xWWRFc5SP8uz41yM__RCjRg9AR-TBxpP0CxPJVDjI1tMZWZUT_0W6BOvPv0Zp4TkB0Jv8bhAsvY2gsDYZIfQ_Ra2Bwp5xX2LLp8qYOfNfRu96oHTDQ3mY4gcqytJXCvjICFNJx1oLD0ed_Q12vuWPM15H-vRCF8gMxgZn9VS_jobB-s0msH",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFnVGNFXk8ForCCVzCAgl_2WKy-Fj1YytHSaOs3vBhP5V9QmNklH-kuh48wPwOs9bp7QaU0v_mCjuKr8PWP2aZSnFikDzcbiMbXY2aLBYmzdHAfS2Qo5r_23KlQCSA7BTX-EoI6-RtQYJNzHAZSpB2AAWrs9HKbrhFjMXqXwqAjB5lkjNxlhX42FudlCdLuk-K8ip0Xa7B3bstwsr_wK-lj6F1YSB6AaWY1RqVAXTUrh11d7TFP5P9AOw1NAg5Cb-IPMcUlMcd0Bf_",
      "https://lh3.googleusercontent.com/AB6AXuC5sClIAfE4vEcub3eFxwNn6LucyLcT_LC4QtC7yNPwLJUBXlgpojgxKE0RxfdDgXmnUGYSlgtQvF7GF9SxvYYRnplvSG-1WYjicsrJEd4tMCij0SykzAtlUjwzHR-WpmveuMGW_PbLtp79nz0ffJeudi5FKaqSITTytZNyd2Z6uMnZK1nUdeXY0TuK0g_zlrjwkS0T8zpvHtOHSCe16PFhuTm_76i21OKQP7WG7y-ITKFyAvGCBCgtnuaE7qKAJDSklnbOxFAqUyw_",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAxizvovicqT6Qo95mAjVSt8_A1fVQpgobVwEH9vS45sFPJq_wvLe6gzfqL5ewmdsoy3HlLCh-Ay4nLyFO5hCmcNZaiPieMgX4ewnHeE-1YznU-wmTZQStgmivnG_-2r2gBrQUo96dvaCeySzkpeMa3HS-o2Vn6u8IC7GfJ1WzyUJni14fOV8NeGFl_3Ma4BCAm7EYmaWw3TH-4B2Zk-7xj3IQkRmWXb5zoJX7muQEL7ZvLCnrBnFxZEuF_IjbdVmg73vlIbRqL8PxJ",
    ],
  },
  {
    id: "2",
    title: "Q3 Marketing Strategy",
    lastActivity: "Jane Smith updated 5 hrs ago",
    teamMembers: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFUykZgIWKiG5ncWZYOfBQ1a0TMdqLRcCPCdO8Kej7qLc8ZH5Fn55KNS-ArL_G6ar3mvkEM5NFam9dKp8gPJvTJDtqzPAAP-pHwXfUTBjB5F6JJbEuhCb7LU03GAXe3T1r1teiXKEKF6WebB08rVkCEvRnBWFC8IAZ_fUmD9_AXIoj0f7lmVqnEIEmt807iKdy-Uy8SMhfQXVtORY8T_kmgpHFdU_A5vvbGi9BwB8efp5kU3_H7JyltNmne_a6YehYYRba-QBeXU-x",
    memberAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA34HECTByH5HROdkLQm4qimY34GAA1mD7qFda4YB9_gVJIb4vbvIYK5p6u5SvBVTixdHpJ06A3l6SaP5jqRIktee9Oi2duXi1mcwQVqsmDs6cysTgLyvUgc-xIugchCayCbXHaYGPNlJgq7Gedik1hAgBz8JXUf2NgWBT9GrzlW3QxKYr3CTow-k6izOh5SkG86k24nNrNguDPC8Pjaz92sNLs-LPPYIwkA9tvLJIQX5jtJESG9HAqZo2G9mwtega8vDuWn7m4Mjc2",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTYSiGZFtZS2O6tZ6uV-PEA8lQ3SOvTmTYegRWvV2INZ8fj4SSb8UtZugJJVCBgH2PLFChfueLow4pqYKpAk2FvxVPejnKEQaWxrJLa5g_R2vIBXGtXJXoRJJ9FxkBL1DXH3QxTWDTjK9uCyL27-1W20XmlWY3d2eY3XaHcSPgyy0vmVv_Zuzy0bexeW7w4J3bV2BJQi7_MZRs6WKCQ7BABrmVsyGoffoCAkslkNY8H02E8aF0gUZRrbzYm8NN64iShlKxSzbSeBPQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBi1Qfjnh1D74A3wJ9_4B9DiZTiXzT3fgGn4z573zUYktr4_I74L8A3jw60F8yL9vxxsD-ug72QABEMkW3kc5DVDl28qEAjz8hUQTLIn7fuTekn09d8mP-LuB0KF3deJEeT-_EKnqPfALH1XVt24UCHYfTtHpIH4dCQNUBa6rRG6TzUWtbEP1S34SV5tTH1L6gat66EqdHFSVrcA5DYi1wb2ENobGQg3Krmz_3HcZoJ7SOQQQC2Q1XFzztkQhd8ABByBE6SA31jPZCO",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbv6CWMNtqcr_uDOuoW8I3ABijFZPODjnFHb7r7gXAGMSNuTKdsPJQ19ENw3bDuM3kBHuzYCIJt2gaFIbWnALToj40K4i4bZp1KbNf_BkJPjV3FATApds6RgWj_bIVQm9fCXO9g3xxasel4NiW_6mkbAUalUnW0GVvgDu7uHx_0h-w7Wl4dk8xwtHDzjXACCwIMMqmQaxHHgKutv_ZYXT5-xaoqqfaxoDUZLzf5mBktNmhd9b3YCyx_78vwTC5_Z3kwQcr2NgtQqOt",
    ],
  },
];
import NoteCard from "@/components/NoteCard";
export default function Notes() {
  return (
    <div className="bg-surface-muted-dark dark:bg-surface-primary min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] h-full overflow-y-hidden">
      <div className="relative  lg:flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-[#1f1d33] border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col justify-between grow overflow-y-auto">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                  data-alt="SyncNotes app logo, a stylized letter S inside a circle"
                  // style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkYdhdMThoGbFIt9mbzcJ_ktDC_ym0DMvh9NlDQhvHUr-XCptWh0LJPcrMqPGpxQhzRNkRf1Q2CC0b-9BBjCZh9C3a6yP5CL8RHJ2q8Uf1K21bP0mjfCKNklLVDjPdh7o96eEv04BfRBgJ2FLmu0X7DWpu2Xx18zfKzSgNa9ma8HOGW-tgYGo7PH0PLIJeP7w888BE6XCFAkw8vsj-Xp0c4GRqrUcq0Hh2oj9aGQX9nXQQ0ibC0aWnMvJiN813sqhh0dFPzDax-Fwo');"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUA97my9r3v9o56ysIm0qGZy9MhibpcZ5g08EQ4vXPTO-UBfctA7eE5MZB5N1tlaFpNoXlPfDzzK9sqxQVZpjjFcaJoFLNkzNibDW_l8EGR_gOnyw5MZ9RardcOCWGVg7afF4s_VlcexODAuEjSTS3GxfuZXwnFrgIeQkClXlSes7B6TQig8odNPbHGDIRpU0qz8dKaP3PCKlclJH3B8X66IaNDq08yS8wfnVNK4hkTaUJltOolFURhp0oiE16ICgky6b6YfXZ76Gp')",
                  }}
                ></div>
                <div className="flex flex-col">
                  <h1 className="text-[#0f0e1b] dark:text-white text-base font-bold leading-normal">SyncNotes</h1>
                  <p className="text-[#564f96] dark:text-gray-400 text-sm font-normal leading-normal">
                    Collaborative Workspace
                  </p>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary" href="#">
                  {/* <span className="material-symbols-outlined text-primary text-2xl">description</span> */}
                  <span className="text-primary text-sm font-medium leading-normal">All Notes</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  href="#"
                >
                  {/* <span className="material-symbols-outlined text-[#0f0e1b] dark:text-white text-2xl">star</span> */}
                  <span className="text-[#0f0e1b] dark:text-white text-sm font-medium leading-normal">Favorites</span>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  href="#"
                >
                  {/* <span className="material-symbols-outlined text-[#0f0e1b] dark:text-white text-2xl">settings</span> */}
                  <span className="text-[#0f0e1b] dark:text-white text-sm font-medium leading-normal">Settings</span>
                </a>
              </nav>
            </div>
            <div className="flex flex-col">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                href="#"
              >
                {/* <span className="material-symbols-outlined text-[#0f0e1b] dark:text-white text-2xl">logout</span> */}
                <span className="text-[#0f0e1b] dark:text-white text-sm font-medium leading-normal">Logout</span>
              </a>
            </div>
          </div>
        </aside>
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-scroll">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <label className="flex flex-col w-full ">
                  <div className="flex w-full flex-1 items-stretch rounded-xl">
                    <div className="text-[#564f96] dark:text-gray-400 flex border-none bg-white dark:bg-[#1f1d33] items-center justify-center pl-4 rounded-l-xl border-r-0">
                      {/* <span className="material-symbols-outlined">search</span> */}
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 overflow-hidden rounded-r-xl text-[#0f0e1b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-[#1f1d33] h-full placeholder:text-[#564f96] dark:placeholder:text-gray-400 px-4 py-2 pl-2 text-base font-normal leading-normal"
                      placeholder="Search discussions..."
                      value=""
                    />
                  </div>
                </label>
              </div>
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text gap-2 text-base font-bold leading-normal tracking-[0.015em]  btn-primary focus-visible:outline-surface-primary transition-colors duration-200">
                <span className="material-symbols-outlined">+</span>
                <span className="truncate">Start New Discussion</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 ">
              {[...dummyNotes, ...dummyNotes, ...dummyNotes, ...dummyNotes, ...dummyNotes, ...dummyNotes].map(
                (note, index) => (
                  <NoteCard
                    key={`note-${index}`}
                    title={note.title}
                    lastActivity={note.lastActivity}
                    teamMembers={note.teamMembers}
                    image={note.image}
                    memberAvatars={note.memberAvatars}
                  />
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
