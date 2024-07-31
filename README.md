## Installation
To set up the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/Denis-Dinkov/decode-extrinsic.git
npm install
```

## Development
To facilitate development and testing, the project supports running specific example modules based on the provided argument. For instance:

```bash
npm start 1
```

In this example, `1` corresponds to `src/example-1`.
The script will dynamically import and run the code in the specified module, allowing for focused testing and debugging of specific features or modules.
The number `1` can be replaced with other numbers corresponding to other example modules as defined in the `examplesMap` within the `main.ts` file.
