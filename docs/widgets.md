# Widgets

The navbar allows to be customized with widgets which provide extra features.  
Some widgets may require extra configuration.  
Available widgets are in `src/components/`.  
Here is an overview of all widgets that are available within Homer.

## Clock

Displays current time in navbar. Allows 12-hour AM/PM format (default) as well as 24-hour format.

```yaml
navbar:
  widgets:
    - type: "Clock"
      militaryTime: true # Optional, defaults to false and displays AM/PM
```