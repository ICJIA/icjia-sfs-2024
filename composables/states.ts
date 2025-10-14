/**
 * Global state composables for the ICJIA Safe From the Start application.
 * These composables provide shared reactive state across components using Nuxt's useState.
 *
 * @module composables/states
 */

/**
 * Counter state composable for demonstration/testing purposes.
 * Provides a reactive number that persists across component instances.
 *
 * @returns {Ref<number>} Reactive counter value initialized to 0
 * @example
 * const counter = useCounter()
 * counter.value++ // Increments the global counter
 */
export const useCounter = () => useState<number>("counter", () => 0);

/**
 * Color state composable for theme or UI customization.
 * Provides a reactive color string that can be shared across components.
 *
 * @returns {Ref<string>} Reactive color value initialized to "pink"
 * @example
 * const color = useColor()
 * color.value = "blue" // Changes the global color
 */
export const useColor = () => useState<string>("color", () => "pink");

/**
 * Navigation toggle state composable.
 * Controls the visibility of the mobile navigation sidebar/drawer.
 * Used by TheNavV2, TheNav, and TheSidebar components.
 *
 * @returns {Ref<boolean>} Reactive boolean for navigation drawer state (false = closed, true = open)
 * @example
 * const nav = useNavToggle()
 * nav.value = !nav.value // Toggles the navigation drawer
 */
export const useNavToggle = () => useState<boolean>("nav", () => false);

/**
 * Simple counter composable with initial value parameter.
 * Allows creating a counter with a custom starting value.
 *
 * @param {number} val - Initial value for the counter
 * @returns {Ref<number>} Reactive counter initialized to the provided value
 * @example
 * const myCounter = useSimpleCounter(10)
 * myCounter.value // Returns 10
 */
export const useSimpleCounter = (val: number) =>
  useState<number>("test", () => val);

/**
 * Translation modal toggle state composable.
 * Controls the visibility of the translation/language selection modal.
 * Currently used when translation features are enabled in app.config.js.
 *
 * @returns {Ref<boolean>} Reactive boolean for translation modal state (false = hidden, true = visible)
 * @example
 * const translateModal = useTranslateToggle()
 * translateModal.value = true // Opens the translation modal
 */
export const useTranslateToggle = () =>
  useState<boolean>("translate", () => false);
