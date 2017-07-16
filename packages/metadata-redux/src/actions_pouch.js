/**
 * ### Действия и типы действий адаптера pouchdb в терминах redux
 *
 * Created 05.09.2016
 */

export const DATA_PAGE   = 'POUCH_DATA_PAGE'     // Оповещение о загрузке порции локальных данных
export const LOAD_START  = 'POUCH_LOAD_START'    // Оповещение о начале загрузки локальных данных
export const DATA_LOADED = 'POUCH_DATA_LOADED'   // Оповещение об окончании загрузки локальных данных
export const DATA_ERROR  = 'POUCH_DATA_ERROR'    // Оповещение об ошибке при загрузке локальных данных
export const NO_DATA     = 'POUCH_NO_DATA'       // Оповещение об отсутствии локальных данных (как правило, при первом запуске)

export const SYNC_START  = 'POUCH_SYNC_START'    // Оповещение о начале синхронизации базы doc
export const SYNC_ERROR  = 'POUCH_SYNC_ERROR'    // Оповещение об ошибке репликации - не означает окончания репликации - просто информирует об ошибке
export const SYNC_DATA   = 'POUCH_SYNC_DATA'     // Прибежали изменения с сервера или мы отправили данные на сервер
export const SYNC_PAUSED = 'POUCH_SYNC_PAUSED'   // Репликация приостановлена, обычно, из-за потери связи с сервером
export const SYNC_RESUMED= 'POUCH_SYNC_RESUMED'  // Репликация возобновлена
export const SYNC_DENIED = 'POUCH_SYNC_DENIED'   // Разновидность ошибки репликации из-за недостатка прав для записи документа на сервере

let sync_data_indicator;

/**
 * ### После загрузки локальных данных
 * если разрешено сохранение пароля или демо-режим, выполняем попытку авторизации
 * @param page
 * @return {{type: string, payload: *}}
 */
export function data_loaded(page) {

	return function (dispatch, getState) {

		// First dispatch: the app state is updated to inform
		// that the API call is starting.

		dispatch({
			type: DATA_LOADED,
			payload: page
		});


		const { meta } = getState(),
			{ $p } = meta;

		// если вход еще не выполнен...
		if(!meta.user.logged_in){

			setTimeout(function () {

				// получаем имя сохраненного или гостевого пользователя
				let name = $p.wsql.get_user_param('user_name');
				let password = $p.wsql.get_user_param('user_pwd');

				if(!name &&
					$p.job_prm.zone_demo == $p.wsql.get_user_param('zone') &&
					$p.job_prm.guests.length){
					name = $p.job_prm.guests[0].name
				}

				// устанавливаем текущего пользователя
				if(name)
					dispatch(user_defined(name));

				// если разрешено сохранение пароля или гостевая зона...
				if(name && password && $p.wsql.get_user_param('enable_save_pwd')){
					dispatch(user_try_log_in($p.adapters.pouch, name, $p.aes.Ctr.decrypt(password)));
					return;
				}

				if(name && $p.job_prm.zone_demo == $p.wsql.get_user_param('zone')){
					dispatch(user_try_log_in($p.adapters.pouch, name,
						$p.aes.Ctr.decrypt($p.job_prm.guests[0].password)));
				}

			}, 10)
		}
	}

}

export function sync_data(dbid, change) {


	// Thunk middleware знает, как обращаться с функциями.
	// Он передает метод действия в качестве аргумента функции,
	// т.о, это позволяет отправить действие самостоятельно.

	return function (dispatch, getState) {

		// First dispatch: the app state is updated to inform
		// that the API call is starting.

		dispatch({
			type: SYNC_DATA,
			payload: {
				dbid: dbid,
				change: change
			}
		})

		if(sync_data_indicator){
			clearTimeout(sync_data_indicator);
		}

		sync_data_indicator = setTimeout(function () {

			sync_data_indicator = 0;

			dispatch({
				type: SYNC_DATA,
				payload: false
			})

		}, 1200);
	}
}

export function data_page(page) {
	return {
		type: DATA_PAGE,
		payload: page
	}
}

export function load_start(page) {
	return {
		type: LOAD_START,
		payload: page
	}
}

export function sync_start() {
	return { type: SYNC_START }
}

export function sync_error(dbid, err) {
	return {
		type: SYNC_ERROR,
		payload: { dbid, err }
	}
}

export function sync_paused(dbid, info) {
	return {
		type: SYNC_PAUSED,
		payload: { dbid, info }
	}
}

export function sync_resumed(dbid, info) {
	return {
		type: SYNC_RESUMED,
		payload: { dbid, info }
	}
}

export function sync_denied(dbid, info) {
	return {
		type: SYNC_DENIED,
		payload: { dbid, info }
	}
}

export function data_error(dbid, err) {
	return {
		type: DATA_ERROR,
		payload: { dbid, err }
	}
}

export function no_data(dbid, err) {
	return {
		type: NO_DATA,
		payload: { dbid, err }
	}
}