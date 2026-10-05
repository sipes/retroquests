// Mop & Galaxy — walkthrough text. SERVER ONLY.
// This file is imported by src/catalog.js (Worker) and by the local dev host from outside public/.
// It must never be copied into public/ or bundled into browser assets: it is the paid product.
// Each puzzle: [nudge, clue, full solution]. Puzzle ids match public/games/mop-galaxy/data.js PUZZLES.
export const MOP_GALAXY_WALKTHROUGH_SKU = 'mop-galaxy-walkthrough';
export const MOP_GALAXY_HINTS = {
  // Chapter 1 — Deck 9
  'wake-up': [
    'You are not dressed for a crisis. Where did you leave your things?',
    'Your coverall is on the hook. Check its pockets.',
    'Take the coverall: you get your contractor badge and a lucky ten-credit coin. Look at yourself first for a point.'
  ],
  'vent-peek': [
    'Mop keeps saying it signed for a delivery. Where did the delivery go?',
    'Deck 8 is directly below you. There is a vent in the closet floor.',
    'Look through the floor vent. You see the Vellacourt boarding party and their clipboard, and learn what they think they have found.'
  ],
  'snack-tool': [
    'The only real tool in the closet is doing a job already. Don\'t just yank it.',
    'Something needs to take the shelf\'s weight before the wrench comes out. The vending machine on Deck 9 sells exactly one thing.',
    'Look at the shelves. Use the coin on the vending machine in the corridor for a SnakPak, use the SnakPak on the shelves to wedge them, then take the wrench. Keep the wrapper.'
  ],
  'up-and-out': [
    'Mop cannot climb. You cannot fit down a chute. You will have to split up.',
    'The ceiling grille above the ladder is bolted; the laundry chute in the closet is Mop-sized. Take your own mop too.',
    'Use the wrench on the bolts (or grille) from the ladder. Use Mop on the laundry chute so it goes down to the ducts. Take your mop from the closet. Then climb the ladder.'
  ],
  // Chapter 2 — Cryo bay
  'read-the-room': [
    'Read what they pinned up, and read what the captain wrote about you.',
    'There is a notice on the main door and a nameplate on the empty pod.',
    'Take the notice ("no conscious crew aboard") and look at the nameplate on pod 1,205 ("reserved, do not freeze"). Together they are the loophole.'
  ],
  hide: [
    'The flashlights are counting pods and every action brings them closer. Where would a person not be noticed in a cryo bay?',
    'There is one empty pod with your name on it. Fog would slow the searchers down too: look at the floor drain and the coolant hose on the cart.',
    'Take the coolant hose and use it on the floor drain (points, and the sweep slows). Then use (or hide in) the empty pod. They log you as empty and move on.'
  ],
  roster: [
    'Upstairs, the crew gallery says who counts. Read it, and look hard at the captain.',
    'Take the wall roster. Look at the captain\'s pod display: it wants an eight-digit code.',
    'Take the roster from the gallery wall and look at the captain\'s pod. You now know you need the captain\'s thaw code.'
  ],
  'duct-two': [
    'The galley is above you. The duct grille is hot enough to hurt.',
    'There is a fire blanket on a hook in the gallery.',
    'Take the fire blanket, use it on the duct grille, then use the duct to climb up to the galley.'
  ],
  // Chapter 3 — Galley & hydroponics
  'feed-gumbo': [
    'Something in the compost unit is interested in plastic. Ada\'s drawing told you so.',
    'Trays are plastic. So is the SnakPak wrapper.',
    'Look at the compost unit, then use a plastic tray (or the wrapper) on it. Gumbo climbs out; take Gumbo.'
  ],
  'thistle-crew': [
    'Thistle issues crew cards, and Thistle only believes the roster.',
    'The roster has a handwritten line about you in the captain\'s hand.',
    'Talk to Thistle, then give (show) the roster to Thistle. It prints you a temporary crew card. Now take a tomato and the plant ties.'
  ],
  locker: [
    'The tool locker wants a crew card, not a contractor badge.',
    'Use the crew card on the locker reader.',
    'Use the crew card on the tool locker and take the toolkit, rations and oven cleaner.'
  ],
  'dog-the-door': [
    'The boarders are coming to the galley. The door wheel needs holding while the dogs seat.',
    'Gumbo can grip things, if it is big enough. Thistle\'s plant ties are plastic.',
    'Give the plant ties to Gumbo (it grows). Use Gumbo on the door wheel. Run the dishwasher for noise cover (points).'
  ],
  'vault-tease': [
    'Thistle has noticed something about what the salvagers keep asking about.',
    'Once you have a crew card, ask Thistle about the vault, or look at the vault.',
    'With the crew card, talk to Thistle (or look at the seed vault). Thistle tells you Vane asked about the seeds twice. Then take the service duct down.'
  ],
  // Chapter 4 — Engineering
  'distract-ilse': [
    'Ilse cannot hear you, but she turns around. You need her somewhere else for a while.',
    'The fire-suppression panel has a TEST button for Zone 4, at the far end of the catwalk.',
    'Look at Ilse (points). Press the fire-suppression panel. Ilse runs off for a handful of actions; do your work at the intake and close the housing before she is back.'
  ],
  'foul-the-loop': [
    'Stop the jump without anyone noticing until it is too late. The gauge only reads what gets past the filter.',
    'Pull the filter, pour two things into the loop that set like wax when hot, then put the filter back so the gauge lies for you. Mop has one of the things.',
    'Talk to Mop for floor polish. With Ilse distracted: use the toolkit on the intake (filter out), use the polish on the intake, use the oven cleaner on the intake, use the filter on the intake. Look at the gauge.'
  ],
  'lose-the-mop': [
    'Airlock A needs a second hand to hold the inner latch, and it will not cycle with Mop inside.',
    'Something long and stiff that you do not mind losing. You have carried it all day.',
    'With a checked suit and the loop fouled, use your own mop on Airlock A. It holds the latch; the outer door takes it. Mop stays behind and finds another way.'
  ],
  'suit-up': [
    'Everything you need is in the reactor anteroom, and so is a reason not to stay long.',
    'Take the dosimeter first. The helmet visor is cracked; the toolkit has tape.',
    'In the anteroom: take the dosimeter, suit, helmet, O2 bottle and tether. Use the toolkit on the helmet. Use the suit-check terminal.'
  ],
  // Chapter 5 — The hull
  'clip-on': [
    'The induction video said it. The clip is the important part.',
    'Tether cleats by the airlock.',
    'Use the tether on the cleats before you move anywhere. Every action uses air; do not dawdle.'
  ],
  'bridge-the-gap': [
    'Two metres of missing handrail. Something flat and square would do.',
    'A shield plate is hanging loose by the airlock.',
    'Take the shield plate, use it on the gap in the handrail, then go aft.'
  ],
  'aim-the-dish': [
    'The dish talks to whoever it points at. Point it at the law.',
    'A lock pin holds the gimbal, the crank is frozen, and you are carrying a canister that calls itself a rocket.',
    'Take the gimbal pin. Use the propellant canister on the crank to thaw it. Use the crank. Look at the relay panel.'
  ],
  broadcast: [
    'The junction box is padlocked. When it is open, say it like crew, not like a janitor.',
    'The toolkit has cutters. The Authority\'s responder wants a vessel and a claim.',
    'Use the toolkit on the padlock, then use the junction box. Choose the formal line: vessel, conscious crew, contesting the filing under 44.7. Then go in through Airlock C.'
  ],
  // Chapter 6 — The bridge
  'coffee-brack': [
    'Brack fills the door. Brack can smell something he hasn\'t had in two years.',
    'The coffee machine works. So would a tomato.',
    'Use the coffee machine and give the coffee (or the tomato) to Brack. Take your contract off the wall while you are there.'
  ],
  'the-argument': [
    'Everything you show Vane, she answers. You need something logged, signed and timestamped.',
    'The ship\'s log console wants a crew card. Query it, and show Vane what it prints.',
    'Show Vane the notice, roster and contract (points, and losses). Use the crew card on the log console for the Deck Officer entry. Give the log printout to Vane.'
  ],
  'mop-arrives': [
    'Mop signed the filing. Mop can unsign it, if it remembers the rule.',
    'Once Mop is on the bridge, use Mop on the salvage filing holo.',
    'After Vane sees the log, Mop arrives. Talk to Mop, then use Mop on the filing. The signature is withdrawn and the filing voided.'
  ],
  'vault-truth': [
    'Ask the one person on the bridge who cannot stop reading things out.',
    'Dorrit has the manifest in his head.',
    'Talk to Dorrit after Vane has seen the log. He tells you the seed vault is pre-sold to Vellacourt Agri. Then talk to Vane to be escorted out.'
  ],
  // Chapter 7 — The Lien
  'get-in': [
    'Vellacourt write everything down, including codes.',
    'Look in the crate you were told to wait in.',
    'Search the crate for the delivery slip (code 4471). Use the keypad and choose 4471. Take Brack\'s sandwich too.'
  ],
  'the-code': [
    'The thaw code is in Vane\'s jacket pocket in her quarters, and the jacket has a guard.',
    'Precedent the cat wants something better than rations.',
    'Give Brack\'s sandwich to the cat. Search the jacket\'s breast pocket for the thaw code card. Use the toolkit on the lockbox for clamp key B. Use Gumbo on the bulkhead vent so it grows.'
  ],
  'skating-rink': [
    'Dorrit will not move for you. He might move for Vane, and he will not see a floor in the dark.',
    'Turn the hold lights off, have Mop do the corridor, then use the loudspeaker in your best Vane voice.',
    'Use the light switch in the hold. In the clamp room use Mop on the corridor (polish). Use the loudspeaker. Dorrit slides; take clamp key A from where it lands.'
  ],
  'two-keys': [
    'Two keyholes a metre apart, turned together, then the lever. You have two hands and a friend.',
    'A cat-sized Gumbo can hold a key.',
    'Give key B to Gumbo (large). Use key A on keyhole A, use Gumbo on keyhole B, use the panel to turn both, then use the lever.'
  ],
  'get-out': [
    'Sixty seconds and three rooms. Mop is strong.',
    'Go straight back: corridor, hold, collar. Use the pressure door or go back to the Hyacinth with Mop beside you.',
    'After the lever, do nothing else: corridor to the hold, back to the collar, then use the door back to the Hyacinth. Mop holds the pressure door for you.'
  ],
  // Chapter 8 — Thaw
  'ride-the-lift': [
    'The lift is Mop-sized. You are not. It will not move with the door blocked.',
    'There is a hatch in the roof.',
    'Use the roof hatch (fold through), then use the deck buttons. Mop drives.'
  ],
  thaw: [
    'Eight digits, then ninety seconds, then Brack. Deal with Brack.',
    'Brack is hungry, and Brack has a contract with the same clause 9 as yours.',
    'Use the thaw code card on the thaw console. Give Brack the rations (or tomato/coffee), or talk to him and tell him he is not crew either. Then use the captain\'s pod to wake her.'
  ],
  'who-are-you': [
    'The captain logged your rank fourteen months ago. Use it.',
    'Deck Officer (Custodial), per the log, 03:14.',
    'Answer "Deck Officer (Custodial), per your log". On the bridge, talk to Okonjo about the vault (knowing it was pre-sold earns the last points).'
  ]
};
