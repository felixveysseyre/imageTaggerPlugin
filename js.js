$(function()
{
	$('#test').imageViewer(
		{
			'activateTagging': true,
			'image': 'image2.jpg',
			'imageThumbnail': 'imageThumbnail2.jpg',
			'onTagAdded': function(tag){console.log('added', tag)},
			'onTagMoved': function(tag){console.log('moved', tag)},
			'onTagClicked': function(tag){console.log('clicked', tag)}
		},
		[
			{
				'id': 12,
				'class': 'test1',
				'ratioX': 0.5,
				'ratioY': 0.5
			},
			{
				'id': 24,
				'ratioX': 0.4,
				'ratioY': 0.2
			},
			{
				'id' : 42,
				'class': 'test7',
				'ratioX': 0.6,
				'ratioY': 0.3
			}
		]
	);
});