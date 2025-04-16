import { showConsoleLibraryError } from '../utils/general.util.js';
import getBotTexts from '../helpers/bot.texts.helper.js';
export async function questionAI(text) {
    try {
        //
    }
    catch (err) {
        showConsoleLibraryError(err, 'questionAI');
        throw new Error(getBotTexts().library_error);
    }
}
export async function imageAI(text) {
    try {
        //
    }
    catch (err) {
        showConsoleLibraryError(err, 'imageAI');
        throw new Error(getBotTexts().library_error);
    }
}
