# AprilTags

A repo to store rescaled AprilTags and rescaling tools, with pre-scaled `16h5`, `25h9`, and `36h11` tag families under `dist` folder.
**Note:** pre-rescaled according to FRC 2024 documentation to 6.5 inch (165.1 mm).

## Use

Before running any of the scripts, make sure to run `npm i`

To resize the PNGs for a certain tag family, run command:

```shell
node scripts/resize [tagFamily] [resizedWidth]
```

- `tagFamily` includes `16h5`, `25h9`, `36h11`, and `circle21h7`
- `resizedWidth` is measured in mm

## TODOs

- Add support for conversion to SVGs

## Change Log

- **2024.03.24:** Initial publish
