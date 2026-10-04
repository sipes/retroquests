// Last Night in Port Lucky — walkthrough text. SERVER ONLY.
// This file is imported by src/catalog.js (Worker) and by the local dev host from outside public/.
// It must never be copied into public/ or bundled into browser assets: it is the paid product.
// Each puzzle: [nudge, clue, full solution]. Puzzle ids match public/games/port-lucky/data.js PUZZLES.
export const PORT_LUCKY_WALKTHROUGH_SKU = 'port-lucky-walkthrough';
export const PORT_LUCKY_HINTS = {
  // Chapter 1
  goat: [
    "The goat isn't handing anything over for free. What would it rather be chewing?",
    'There is food in this suite. It is very expensive and very small. Check the minibar.',
    'Open the minibar and take the Crackers of Regret. Then use the crackers on the goat. It drops your keycard.'
  ],
  clue: [
    'Last night left you a few souvenirs. One of them is large, brass and lying on the floor.',
    'Something papery is stuck deep inside the tuba.',
    'Take (or search) the tuba to pull out the valet ticket. Calling the front desk on the phone tells you why it matters.'
  ],
  door: [
    'You need two things before you leave: a way through the door, and a lead on where Benny went.',
    'The lock wants your keycard. The lead is the valet ticket.',
    'Once you have the keycard and the valet ticket, use the keycard on the door.'
  ],
  // Chapter 2
  valet: [
    'Kevin only deals in one currency.',
    'You brought something from the suite that belongs at this valet stand.',
    'Give the valet ticket to Kevin (use the ticket on the valet).'
  ],
  truck: [
    'Your new vehicle may know more about last night than you do.',
    'Unlock it with whatever Kevin handed you, then look inside.',
    'Use the truck keys on the ice-cream truck. Take the shoe and the receipt from the serving window, then take the exit ramp.'
  ],
  // Chapter 3
  'earl-talk': [
    'Earl talks to regulars. What does a regular do in a karaoke bar?',
    'You need a token for the machine. Machines that take coins also give coins back. Look at the jukebox.',
    'Take the tokens from the jukebox coin return. Use a token on the karaoke machine, then use the microphone. Once Earl calls you a regular, give him the pawn receipt and he opens the cage.'
  ],
  'duane-trophy': [
    'Duane is a sore loser, and a sleeping one. He might feel better if he knew who beat him and how.',
    'Wake him up (singing does it), then show him the winner. There is a photo of the winner on the wall of Polaroids.',
    'Take Benny\'s Polaroid from the wall. After you have sung, talk to Duane, then use the Polaroid on Duane. He tells you Benny left with Captain Marguerite at 9:20.'
  ],
  'lilac-lead': [
    'Earl\'s ledger has the buyer\'s name. Earl\'s thumb is on the ledger.',
    'Earl cares about one thing more than money. Show him something about his goat, through the cage window.',
    'In the cage, use the Polaroid on Earl at the window. While he\'s distracted, take the ledger page. Also look at the shelf and take the lilac feather.'
  ],
  'alley-truck': [
    'Mr. Sprinkles won\'t start. An hour of jingle will do that to a battery.',
    'Once you\'re a regular and the cage is open, Earl is willing to lend you something.',
    'Talk to Earl after he has opened the cage: he gives you jump leads. In the alley, use the leads on the truck hood. Then leave by the street once you know where Benny went and who bought the ring.'
  ],
  // Chapter 4
  'sal-standoff': [
    'Sal only wants two things back. One of them is in your pocket.',
    'You can\'t give Sal a goat right now. You can give him his truck.',
    'Talk to Sal, then give the truck keys to Sal. He keeps your watch as a deposit against the goat you promised. You settle that at the wedding.'
  ],
  'phone-churro': [
    'Nadia is holding your phone hostage. Ask her what she wants.',
    'She wants the churro money, or something for her daughter, who collects plush dolphins.',
    'Either pay Nadia with the wallet once you have it (eleven dollars), or give her the plush dolphin that falls out of the claw machine with your wallet.'
  ],
  'claw-wallet': [
    'The claw is rigged. Think about what else in this arcade can shake things loose.',
    'The strength-test bell is bolted to the same wall as the claw machine. And the hammer has a trick scratched into its handle.',
    'Press coin return on the change machine for a roll of quarters. Try the claw once if you like. Look at the hammer, then use it three times to ring the bell. The wallet and a plush dolphin drop into the chute; take them from the chute.'
  ],
  zora: [
    'Fortune tellers tell fortunes. Hers costs less than a churro.',
    'Use a quarter on Madame Zora\'s booth.',
    'Get quarters from the change machine in the arcade and use them on Zora. She tells you Benny is on the water and that you\'ll need the tuba.'
  ],
  'call-kevin': [
    'You have one phone call\'s worth of battery. Who owes you a favour and is scared enough to deliver a tuba?',
    'The valet has your truck and your room history. He will do anything to make you go away.',
    'Use the phone and choose Kevin. He brings the tuba (and, it turns out, the goat) to the marina.'
  ],
  // Chapter 5
  'spot-benny': [
    'Zora said he\'s on the water. The marina has a thing for looking at the water.',
    'The coin-op telescope on the dock. You still have quarters, and now you know where to look.',
    'With the fortune card in hand, use a quarter on the telescope. You spot the pontoon past the breakwater with Benny on board. Then talk to Marguerite.'
  ],
  'get-oars': [
    'Oscar has your oars. Oscar has a gull problem.',
    'Gulls love churros more than shrimp. You have a churro. (A tuba also works, once Kevin arrives.)',
    'Give the churro to Oscar, or play the tuba on the trolley. The gulls leave and Oscar hands over the oars. Use the oars on the dinghy.'
  ],
  'row-out': [
    'Rowing out is easy. Rowing back against the current is the problem.',
    'Thirty feet of rope on the dock, a cleat, and a captain with nothing to do but hold things.',
    'Take the rope, use it on the dinghy, then use the rope on the cleat (or give it to Marguerite). With the oars in, use the dinghy to row out.'
  ],
  'wake-benny': [
    'Benny needs waking, a shoe, and a way back against that current. The way back is not you.',
    'The cooler wakes him. The shoe on the rail gets him in the boat. Kevin, a tuba and a goat that hates brass are tied to the same cleat as your rope.',
    'On the pontoon, take the shoe from the rail and the cooler, pour the ice water on Benny, then give him the shoe. In the dinghy, use the phone to call Kevin and tell him to play the tuba. Gus bolts and hauls you in.'
  ],
  // Chapter 6
  'get-in': [
    'Dolores won\'t open the door for you. Who does she open the door for?',
    'There\'s a room-service tray in the corridor.',
    'Take the cloche from the tray and use it on door 701.'
  ],
  'the-truth': [
    'Dolores already knows more than you do. She\'s not testing whether you can find the ring. She\'s testing something else.',
    'Give her what proves you were at Earl\'s, look at the photograph and ask about it, and make sure you know why Benny left on that boat. Then stop performing.',
    'Give Dolores the lilac feather. Look at the photo and ask her about Gus. With Marguerite\'s log page in your pocket, talk to her and choose "Tell her everything". She gives you the ring.'
  ],
  'benny-up': [
    'Benny needs something to settle his stomach, and Dolores has made it already.',
    'The tea on the tray is for exactly this.',
    'Take the cup of tea and give it to Benny through the bathroom door.'
  ],
  // Chapter 7
  'dress-benny': [
    'Benny needs to look like a groom in under twelve minutes. Start with hydration.',
    'Water, tuxedo, shoes. The left shoe needs polish; it has been in an ice-cream truck.',
    'In the groom\'s tent: take the water, tuxedo, polish and bow tie. Give Benny the water, use the tuxedo on him, use the polish on the shoe (or on Benny), then give him the shoe.'
  ],
  'earl-problem': [
    'Earl respects exactly one authority: his own rules.',
    'You have a photograph, marked WINNER in Earl\'s handwriting, of Benny winning the goat.',
    'When Earl arrives on the lawn, give him the Polaroid. He accepts that Benny won Gus fairly and leaves.'
  ],
  'sal-problem': [
    'Sal wants a goat. You have one goat and it is not yours to give. Who owns the goat?',
    'Dolores Hartwell owns the goat, an inn, and a pier.',
    'When Sal arrives, talk to Dolores on the lawn. She offers him a concession on the Hartwell pier instead of a goat. Sal gives your watch back.'
  ],
  'ring-bearer': [
    'Someone has to carry the ring. The order of service says it\'s you. There\'s a better candidate with four legs.',
    'Gus\'s bow tie is on the table in the groom\'s tent, and the altar has a ring cushion.',
    'Take the small bow tie from the groom\'s tent and use it on Gus. Then, at the altar, use the ring on the cushion. Priya ties the cushion to Gus.'
  ],
  speech: [
    'The best man gives a speech. You haven\'t written one. You have, however, had a very well-documented day.',
    'Use the pieces of paper you\'ve collected on the lectern at the altar.',
    'Take an order of service from a chair. Use any three of the ledger page, fortune card, logbook page and order of service on the lectern. Dex writes the speech on a napkin.'
  ],
  // Chapter 8
  'the-speech': [
    'You\'ve spent all day learning that the cover story never works.',
    'Rings first (Gus has them). Then at the microphone, tell them whose idea the goat was, and whose test this was.',
    'Use Gus to hand the rings to the reverend. Then use the napkin on the microphone and choose to tell the whole truth: the goat was Benny\'s plan and Dolores was testing you.'
  ],
  'loose-ends': [
    'Everyone who helped you today is at this table. Four of them are owed something small.',
    'Kevin is owed money. Marguerite is owed a page. Earl is owed a song. Benny is owed a look at a watch.',
    'Give the wallet (or your quarters) to Kevin, the logbook page to Marguerite, your last karaoke token to Earl, and use the watch on Benny.'
  ]
};
