import org.cometd.bayeux.*;
import org.cometd.bayeux.client.*;
import org.cometd.client.transport.*;
import org.cometd.client.*;
import java.util.*;
import java.io.InputStream;
import org.eclipse.jetty.client.HttpClient;

import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;

/**
 * This is a client to a node.js+faye server supposely running and listening on localhost:8000, with a topic named "foo"
 * @author christophe.gravier@univ-st-etienne.fr
 */
public class MyContextClient {

	private static final String CHANNEL = "/foo";
	private static final String HOST = "http://localhost:8000/faye";
	private final ClientSessionChannel.MessageListener fooListener = new FooListener();

	public static void main(String[] args) {
		MyContextClient app = new MyContextClient();
	}

	private static class FooListener implements
			ClientSessionChannel.MessageListener {
		public void onMessage(ClientSessionChannel channel, Message message) {
			
			// Here we received a message on the foo channel
			JSONObject json = (JSONObject) JSONSerializer.toJSON(message
					.toString());
			JSONObject values = (JSONObject) JSONSerializer.toJSON(json
					.getString("data"));

			System.out.println("The shutters are : "
					+ values.getString("shutters"));
			System.out.println("Temp : "
					+ (new Integer(values.getString("temp")).toString()));
			System.out.println("Lumi : "
					+ (new Integer(values.getString("lumi")).toString()));

			/**@TODO
			 * To Web Intelligence Master students : in the Ubiquitous Computing lab, handle context awareness here !
			 */

		}
	}

	public MyContextClient()
		{
		try {
		HttpClient httpClient = new HttpClient();
		httpClient.start();

		// Prepare the transport
		Map<String, Object> options = new HashMap<String, Object>();
		ClientTransport transport = LongPollingTransport.create(options, httpClient);
		ClientSession client = new BayeuxClient(HOST, transport);
		client.handshake();	
		
		client.getChannel(CHANNEL).subscribe(fooListener);

        System.out.println("Waiting for streamed data from "+HOST);

		while (true) {
			Thread.sleep(1000);
		}
		}
		catch (Exception e) {
			System.out.println("Erreur !");
			e.printStackTrace();
		}
	
	}
}