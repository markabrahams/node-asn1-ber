export const CustomErrors = {
	InvalidAsn1Error: function(msg: string) {
		var e = new Error()
		e.name = 'InvalidAsn1Error'
		e.message = msg || ''
		return e
	}
}
