
<link rel="stylesheet" href="/chat/style.css">
<script defer src="/chat/chat.js"></script>
<div class="floating-orb bg-primary" id="chat-orb">
	<div class="orb-content">
		<i class="fa fa-comments" aria-hidden="true"></i>
	</div>
</div>

<span class="chatbox-1" id="chatbox-1" hidden>
	<div class="chatbox-header">
		<h2 class="h3 m-2" style="color:white">Customer Support</h2>
	</div>
	<div class="card-body justify-content-center chat-overlay pr-3" id="chat-overlay">

		<div class="card card-body alert-primary mb-3" role="alert">
			Please remember to be respectful. You may not get a response immediately.<br>Good luck, adventurer.
		</div>

		<div class="input-group mb-3">
			<input type="text" class="form-control" placeholder="Your name" id="user_name" aria-label="Your name" aria-describedby="basic-addon1">
		</div>

		<div class="input-group mb-3">
			<input type="text" class="form-control" id="user_email" placeholder="Your email address" aria-label="Your email address">
		</div>

		<div class="form-check mb-4 ml-1">
			<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked">
			<label class="form-check-label" for="flexCheckChecked">
				I confirm that I have read and agree to the rules and privacy policy
			</label>
		</div>

		<div class="input-group justify-content-center">
			<div class="btn btn-primary" id="connect-button" onclick="check_n_connect()">Confirm and Chat</div>
		</div>
	</div>
	<div class="chat-banner" id="chat-banner">Connecting</div>
	<div class="chat-output" id="chat-output"></div>
	
	<div class="input-group" id="chatbox-footer">
	<div class="input-group mb-3">
		<label for="fileToUpload" class="file-upload">
			<i class="fas fa-upload"></i>
			<input type="file" name="fileToUpload" id="fileToUpload" accept="image/jpeg">
		</label>
		<input type="text" id="chatbox-input" class="input-group-prepend mt-1 mb-1 ml-1 form-control" placeholder="Say something..." aria-label="Type here" aria-describedby="send-button">
		<span class="btn btn-primary mt-1 mb-1 mr-1 input-group-append text-center" id="send-button" onclick="send();">Send</span>
	</div>


</div>

</span>
