# Rocket Project

WARNING!!!! THIS PROJECT IS NOT MEANT TO BE USED IN PRODUCTION. IT IS MEANT TO BE USED FOR EDUCATIONAL PURPOSES ONLY.

## Project Overview

This project is a web application that allows users to play a simple game of rocket science. The game involves the user sending a message to another user, who then replies with a message of their own. The game is designed to teach the basics of cryptography and web development.

here are some screenshots of the game:

### Main Screen
![Main Screen](/.github/assets/main.png)

### Sender Screen
![Sender Screen](/.github/assets/sender.png)

### Receiver Screen
![Receiver Screen](/.github/assets/receiver.png)

## Game play
The player must decrypt the code to make the rocket travel from one screen to another. The code is a sequence of colors that the player must enter to decrypt the message. each 2 numbers in the sequence represent a letter in the alphabet.

here is the table of the characters and their corresponding numbers:
| Code | Letter |
|------|--------|
| 00   | A      |
| 01   | B      |
| 02   | C      |
| 03   | D      |
| 04   | E      |
| 05   | F      |
| 06   | G      |
| 07   | H      |
| 08   | I      |
| 09   | J      |
| 10   | K      |
| 11   | L      |
| 12   | M      |
| 13   | N      |
| 14   | O      |
| 15   | P      |
| 16   | Q      |
| 17   | R      |
| 18   | S      |
| 19   | T      |
| 20   | U      |
| 21   | V      |
| 22   | W      |
| 23   | X      |
| 24   | Y      |
| 25   | Z      |

## Features

- Sender and receiver screens (can be 2 differnt computers!)
- Message sending and receiving
- supabase realtime broadcast
- rocket traveling from screen to screen!
- Animations using framer motion


## Installation

1. Clone the repository
2. Install dependencies using `npm install`
3. Create a `.env` file in the root directory and add your supabase url and key (see `.env.example` for an example)
4. Run the application using `npm run dev`

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.